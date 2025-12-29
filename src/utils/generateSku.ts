import crypto from "crypto";

const shortHash = (): string => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

const clean = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
};

export const generateSku = (category: string, color: string, size: string) => {
  const cat = clean(category);
  const col = clean(color);
  const sz = clean(size);

  return `${cat}-${col}-${sz}-${shortHash()}`;
};
