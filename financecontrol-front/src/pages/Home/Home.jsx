import { HugeiconsIcon, SaveMoneyDollarIcon } from "../../assets/icons";
import Header from "../../components/layout/Header/Header";

function Home() {
  return (
    <div>
      <Header title="Início"/>
      <main>
        <HugeiconsIcon
          icon={SaveMoneyDollarIcon}
          size={72}
          color="var(--primary)"
        />

        <h1>Finance Control MPT</h1>
      </main>
    </div >

  );
}

export default Home;
