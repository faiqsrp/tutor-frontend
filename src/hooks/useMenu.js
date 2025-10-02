import { useSelector } from "react-redux";
import { menuItems, adminMenu } from "@/constant/data";

export default function useMenus() {
  const user = useSelector((state) => state.auth.user);
  if (user?.type === "admin") return adminMenu;
  if (user?.type === "tutor") return menuItems;
  return []; // default empty
}