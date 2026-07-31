import { HugeiconsIcon, SaveMoneyDollarIcon } from "../../assets/icons";

function Home() {
  return (
    <main>
      <HugeiconsIcon
        icon={SaveMoneyDollarIcon}
        size={72}
        color="var(--primary)"
      />

      <h1>Finance Control MPT</h1>
    </main>
  );
}

export default Home;
