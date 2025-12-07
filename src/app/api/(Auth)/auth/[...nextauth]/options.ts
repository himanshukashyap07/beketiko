import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";


export const authOption: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Enter username , mobile Number ", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    if (!credentials?.identifier || !credentials?.password) {
                        throw new Error("Credentials are required");
                    }
                    
                    
                    const user = await User.findOne(
                        {
                            $or: [
                                { mobileNumber: credentials.identifier },
                                { username: credentials.identifier },
                            ]
                        }
                    )

                    
                    if (!user) {
                        throw new Error("user not found")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                   
                    if (!isPasswordCorrect) {
                        throw new Error("incorrect Password")
                    }
                    return user;
                } catch (error: any) {
                    // console.log(error);

                    throw new Error("Error occure in login")
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // give data to token form user
            if (user) {
                token._id = user._id?.toString() || "" // user will not give us data esily so we created a file in types folder next-auth.d.ts
                token.username = user.username || ""
                token.fullName = user.fullName || ""
                token.mobileNumber = user.mobileNumber || "";
                token.role = user.role || "";
                token.avatar = user.avatar || "";
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token._id,
                    username: token.username,
                    fullName: token.fullName,
                    mobileNumber: token.mobileNumber,
                    role: token.role,
                    avatar: token.avatar,
                };
            }
            return session;
        }


    },
    // sign in route is automatically created by next-auth and handel by next-auth we doesn't need to create it or worry about it
    pages: {
        signIn: "/signin",
        error: "/signin"
    },
    session: {
        strategy: "jwt",
    },
    // secret key is used to encrypt the jwt token !very important and highly sensitive key
    secret: process.env.NEXTAUTH_SECRET

}














