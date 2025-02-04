import Image from "next/image";
import AppBar from "./components/appBar";
console.log(process.env.GITHUB_ID);
console.log(process.env.GITHUB_SECRET);


export default function Home() {
  return (
    <div >
      Hello there
      <AppBar />
    </div>
  );
}
