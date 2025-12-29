import slugify from "@sindresorhus/slugify";

export const generateSlug = (name: string) => {
  return slugify(name, {
    lowercase: true,
    separator: "-",
  });
};
