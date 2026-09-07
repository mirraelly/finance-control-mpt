import "./Home.css";
import Header from "../../components/layout/Header/Header";
import { HugeiconsIcon } from "@hugeicons/react";
import { SaveMoneyDollarIcon } from "@hugeicons/core-free-icons";

function Home() {
  return (
    <div>
      <main>
        <HugeiconsIcon
          icon={SaveMoneyDollarIcon}
          size={72}
          color="var(--primary)"
        />

        <h1>Finance Control MPT</h1>
      </main>
    </div>
  );
}

export default Home;
