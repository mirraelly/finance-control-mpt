import { HugeiconsIcon, TradeUpIcon } from "../../../assets/icons";

function AuthLayout({ children }) {
  return (
    <main className="login-page">
      <div className="container-login">
        <section className="login-aside">
          <div className="brand">
            <div className="div-logo">
              <HugeiconsIcon
                icon={TradeUpIcon}
                stroke="2"
                size={24}
                color="var(--color-midnight-blue)"
              />
            </div>
            <div className="div-brand-name">
              <span className="brand-name">Finance Control</span>
              <span className="brand-tag">MPT</span>
            </div>
          </div>

          <div className="aside-content">
            <h2 className="aside-content-text">
              Controle total das suas <span>finanças em um só lugar.</span>
            </h2>
            <p>
              Dashboards inteligentes, metas e rastreamento de investimentos.
            </p>
          </div>
        </section>

        <section className="login-card">
          <div>{children}</div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;
