import { useState } from "react";
import {
  HugeiconsIcon,
  Home01Icon,
  SaveMoneyDollarIcon,
  Wallet01Icon,
} from "../../assets/icons";
import Badge from "../../components/common/Badge/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import ThemeToggle from "../../components/common/ThemeToggle/ThemeToggle";
import "./ComponentesTeste.css";

const categoryOptions = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "moradia", label: "Moradia" },
  { value: "entretenimento", label: "Entretenimento" },
];

function Section({ eyebrow, title, description, children }) {
  return (
    <section className="component-lab__section">
      <div className="component-lab__section-heading">
        <span className="component-lab__eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function ComponentesTeste() {
  const [name, setName] = useState("Maria Silva");
  const [category, setCategory] = useState("");
  const [showFullPageLoading, setShowFullPageLoading] = useState(false);

  return (
    <main className="component-lab">
      <header className="component-lab__header">
        <div>
          <span className="component-lab__eyebrow">
            Finance Control / playground
          </span>
          <h1>Componentes comuns</h1>
          <p>
            Uma bancada visual para testar os componentes sem depender do
            back-end.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="component-lab__grid">
        <Section
          eyebrow="01 / ações"
          title="Button"
          description="Variantes, tamanhos, ícones e estados de interação."
        >
          <div className="component-lab__stack">
            <div className="component-lab__row">
              <Button>Principal</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="component-lab__row">
              <Button size="sm">Pequeno</Button>
              <Button size="lg">Grande</Button>
              <Button
                icon={<HugeiconsIcon icon={SaveMoneyDollarIcon} size={18} />}
              >
                Com ícone
              </Button>
              <Button disabled>Desabilitado</Button>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="02 / formulário"
          title="Input & Select"
          description="Campos controlados com dados locais para testar preenchimento e seleção."
        >
          <div className="component-lab__form-grid">
            <Input
              id="component-test-name"
              label="NOME"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Digite seu nome"
              fullWidth
            />
            <Select
              id="component-test-category"
              label="CATEGORIA"
              options={categoryOptions}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              fullWidth
            />
          </div>
          <p className="component-lab__result">
            Valor atual: <strong>{name || "(vazio)"}</strong>
            {category && ` / ${category}`}
          </p>
        </Section>

        <Section
          eyebrow="03 / informação"
          title="Badge & Card"
          description="Use badges para classificar dados e cards para agrupar conteúdo."
        >
          <div className="component-lab__row component-lab__row--wrap">
            <Badge variant="success">Receita</Badge>
            <Badge variant="warning">Alimentação</Badge>
            <Badge variant="info">Moradia</Badge>
            <Badge variant="danger" size="sm">
              Saúde
            </Badge>
            <Badge variant="purple" size="lg">
              Entretenimento
            </Badge>
          </div>
          <div className="component-lab__cards">
            <Card padding="md">
              <div className="component-lab__card-title">
                <HugeiconsIcon icon={Wallet01Icon} size={20} />
                Saldo disponível
              </div>
              <strong className="component-lab__amount">R$ 4.280,90</strong>
              <Badge variant="success" size="sm">
                +12,4% este mês
              </Badge>
            </Card>
            <Card padding="md" shadow={false}>
              <div className="component-lab__card-title">
                <HugeiconsIcon icon={Home01Icon} size={20} />
                Próxima conta
              </div>
              <strong className="component-lab__amount">R$ 890,00</strong>
              <span className="component-lab__muted">Vence em 5 dias</span>
            </Card>
          </div>
        </Section>

        <Section
          eyebrow="04 / estados"
          title="Loading & EmptyState"
          description="Estados de carregamento e ausência de dados prontos para encaixar nas telas."
        >
          <div className="component-lab__state-grid">
            <div className="component-lab__state-box">
              <Loading size="sm" label="Carregando dados..." />
              <Loading size="lg" label="Sincronizando..." />
            </div>
            <div className="component-lab__state-box component-lab__state-box--empty">
              <EmptyState
                icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
                title="Nenhuma transação"
                description="As transações adicionadas aparecerão aqui."
                action={<Button size="sm">Adicionar agora</Button>}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFullPageLoading(true)}
          >
            Visualizar Loading de página inteira
          </Button>
        </Section>
      </div>

      {showFullPageLoading && (
        <div
          className="component-lab__overlay"
          onClick={() => setShowFullPageLoading(false)}
        >
          <Loading fullPage size="lg" label="Carregando página..." />
          <button
            className="component-lab__close-loading"
            type="button"
            onClick={() => setShowFullPageLoading(false)}
          >
            Fechar demonstração
          </button>
        </div>
      )}
    </main>
  );
}

export default ComponentesTeste;
