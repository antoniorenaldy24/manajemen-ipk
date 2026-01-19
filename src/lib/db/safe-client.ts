
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";

/**
 * Returns a customized Prisma Client instance with extensions based on the user Role.
 * This acts as a Logic Database Firewall.
 */
export const getSafeClient = (role: string) => {
    return prisma.$extends({
        query: {
            $allModels: {
                async delete({ model, args, query }) {
                    if (role === 'MAHASISWA') {
                        throw new Error(`[Security] Role ${role} is NOT ALLOWED to DELETE from ${model}.`);
                    }
                    return query(args);
                },
                async deleteMany({ model, args, query }) {
                    if (role === 'MAHASISWA') {
                        throw new Error(`[Security] Role ${role} is NOT ALLOWED to DELETE_MANY from ${model}.`);
                    }
                    return query(args);
                },
                async findMany({ model, args, query }) {
                    // [PB-DB-02] Enforce Soft Delete Check Globally if not already specified
                    // Only for models that satisfy Soft Delete (User, Student)
                    if (model === 'User' || model === 'Student') {
                        if (args.where) {
                            if ((args.where as any).deleted_at === undefined) {
                                (args.where as any).deleted_at = null;
                            }
                        } else {
                            args.where = { deleted_at: null } as any;
                        }
                    }
                    return query(args);
                },
                async findFirst({ model, args, query }) {
                    if (model === 'User' || model === 'Student') {
                        if (args.where) {
                            if ((args.where as any).deleted_at === undefined) {
                                (args.where as any).deleted_at = null;
                            }
                        } else {
                            args.where = { deleted_at: null } as any;
                        }
                    }
                    return query(args);
                }
            }
        }
    });
};
