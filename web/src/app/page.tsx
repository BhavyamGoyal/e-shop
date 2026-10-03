import { connection } from "next/server";
import { HomeTemplate } from "@/components/templates";
import { buildHomeData } from "@/lib/home";

export default async function Home() {
  await connection();
  return <HomeTemplate data={await buildHomeData()} />;
}
