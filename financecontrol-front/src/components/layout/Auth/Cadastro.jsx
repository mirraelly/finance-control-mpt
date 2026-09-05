import { useState } from "react";
import "./Cadastro.css";

export default function Cadastro() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);

  const handleToggleVisibility = (target) => {
    if (target === "password") setShowPassword((value) => !value);
    if (target === "confirm-password") setShowConfirmPassword((value) => !value);
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);

    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrengthScore(score);
  };

  const handleCpfChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) formatted = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if (digits.length > 6) formatted = digits.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (digits.length > 3) formatted = digits.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    setCpf(formatted);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    const terms = document.getElementById("terms");
    if (terms && !terms.checked) {
      alert("Aceite os termos para continuar.");
      return;
    }

    alert("Cadastro enviado com sucesso!");
  };

  return (
    <div className="card">
        <p className="eyebrow">Comece agora — é grátis</p>
        <h1>Crie sua conta</h1>
        <p className="subtitle">Configure sua conta para acompanhar gastos, organizar seu orçamento e ter clareza total sobre suas finanças em um só lugar.</p>
    
        <form id="signup-form" noValidate onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="first-name">Nome</label>
              <div className="input-wrap">
                <input type="text" id="first-name" name="first-name" placeholder="Ana" autoComplete="given-name" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="last-name">Sobrenome</label>
              <div className="input-wrap">
                <input type="text" id="last-name" name="last-name" placeholder="Ribeiro" autoComplete="family-name" />
              </div>
            </div>
          </div>
    
          <div className="field">
            <label htmlFor="email">Endereço de e-mail</label>
            <div className="input-wrap">
              <input type="email" id="email" name="email" placeholder="ana.ribeiro@email.com" autoComplete="email" />
            </div>
            <p className="hint">Enviaremos um link de confirmação para este endereço.</p>
          </div>
    
          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <div className="input-wrap">
              <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" inputmode="numeric" maxlength="14" />
            </div>
            <p className="hint">Usado apenas para verificar sua identidade. Nunca compartilhado.</p>
          </div>
    
          <div className="field">
            <label htmlFor="password">Senha</label>
            <div className="input-wrap has-toggle">
              <input type="password" id="password" name="password" placeholder="Pelo menos 8 caracteres" autoComplete="new-password" />
              <button type="button" className="toggle-visibility" data-target="password" aria-label="Mostrar senha" type="button" onClick={(e) => handleToggleVisibility(e.currentTarget.dataset.target)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div className={`strength${strengthScore > 0 ? ` level-${strengthScore}` : ""}`} id="strength-bar">
              <span></span><span></span><span></span><span></span>
            </div>
            <p className="hint">Use 8+ caracteres com um número e um símbolo.</p>
          </div>
    
          <div className="field">
            <label htmlFor="confirm-password">Confirmar senha</label>
            <div className="input-wrap has-toggle">
              <input type="password" id="confirm-password" name="confirm-password" placeholder="Digite a senha novamente" autoComplete="new-password" />
              <button type="button" className="toggle-visibility" data-target="confirm-password" aria-label="Mostrar senha" type="button" onClick={(e) => handleToggleVisibility(e.currentTarget.dataset.target)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
    
          <label className="terms">
            <input type="checkbox" id="terms" name="terms" />
            <span>Concordo com os <a href="#">Termos de Serviço</a> e a <a href="#">Política de Privacidade</a>.</span>
          </label>
    
          <button type="submit" className="submit">
            Criar conta
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
    
          <p className="footnote">Protegido por criptografia de 256 bits. Leia nossa <a href="#">política de dados</a>.</p>
        </form>
    
        <p className="signin">Já tem uma conta? <a href="#">Entrar</a></p>
      </div>
    
    <script src="script.js"></script>
  );
}
