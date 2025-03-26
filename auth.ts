import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

//@ts-expect-error
export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [GitHub],
   callbacks: {
    async signIn ({
        //@ts-expect-error
        user: {name,email,image},
       //@ts-expect-error
         profile: {id,login,bio},
    }) {
        const existingUser = await client.withConfig({useCdn: false}).fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
            id,
        });

        if(!existingUser) {
           await writeClient.create({
            _type: 'author',
            id,
            name,
            username: login,
            email,
            image,
            bio: bio || "",
           })
        }

        return true;
    },
    //@ts-expect-error
    async jwt({token,account,profile}){
        if(account && profile){
            const user = await client.withConfig({useCdn:false}).fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
                id: profile?.id,
            });

            token.id = user?._id;
        }

        return token;
    },
    //@ts-expect-error
    async session({session, token}){
        Object.assign(session, {id: token.id});
        return session;
    }
   },
});