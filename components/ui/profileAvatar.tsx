import { UserType } from "@/app/admin/dashboard/page";
import { LoggedUser } from "@/types/user";
import Image from "next/image";

// Define a color map for initials (first letters of names)
const letterColorMap: Record<string, string> = {
  A: "e57373", B: "f06292", C: "ba68c8", D: "9575cd",
  E: "7986cb", F: "64b5f6", G: "4dd0e1", H: "4db6ac",
  I: "81c784", J: "aed581", K: "dce775", L: "fff176",
  M: "ffd54f", N: "ffb74d", O: "ff8a65", P: "a1887f",
  Q: "90a4ae", R: "f44336", S: "e91e63", T: "9c27b0",
  U: "673ab7", V: "3f51b5", W: "2196f3", X: "03a9f4",
  Y: "00bcd4", Z: "009688"
};

// Get background color from first letter
const getBackgroundColor = (name: string): string => {
  const firstChar = name.trim().charAt(0).toUpperCase();
  return letterColorMap[firstChar] || "cccccc"; // default gray if not A–Z
};

export default function ProfileAvatar({ loggedUser }: { loggedUser: LoggedUser | null | UserType }) {
  const hasImage = Boolean(loggedUser?.image);
  const fallbackName = loggedUser?.name || "User";
  const bgColor = getBackgroundColor(fallbackName);

  return (
    <div className="relative">
      <Image
        src={
          hasImage
            ? loggedUser?.image!
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fallbackName
              )}&background=${bgColor}&color=ffffff&rounded=true`
        }
        alt="Profile"
        width={32}
        height={32}
        className="h-8 w-8 rounded-full"
      />
      <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-upwork-green"></span>
    </div>
  );
}
