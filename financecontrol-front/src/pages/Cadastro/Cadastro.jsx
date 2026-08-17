import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import { HugeiconsIcon, TradeUpIcon, CheckIcon } from "../../assets/icons";
import "./Cadastro.css";



function Cadastro() {
    const [nome, setNome] = useState("")
    const [sobrenome, setSobrenome] = useState("")
    const [email, setEmail] = useState("")
    const [cpf, setCpf] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [aceitouTermos, setAceitouTermos] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()


    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")

        if (senha !== confirmarSenha) {
            setError("As senhas não correspondem.")
            return;
        }
        if (senha.length < 8) {
            setError('a senha deve ter pelo menos 8 caracteres')
            return;
        }

        if (!aceitouTermos) {
            setError("Você precisa concordar com os termos para continuar.")
            return
        };

        setLoading(true)

        try {
            await authService.register({
                nome: `${nome} ${sobrenome}`.trim(),
                email,
                cpf,
                senha,
            })
            navigate("/")
        } catch (err) {
            const message = err?.response?.data?.message || err?.message;
            setError(message || "Erro ao realizar cadastro. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="cadastro-page">
            <div className="container-cadastro">
                <section className="cadastro-aside">
                    <div className="brand">
                        <div className="div-logo">
                            <HugeiconsIcon
                                icon={TradeUpIcon}
                                stroke="2"
                                size={24}
                                color="var(--color-midnight-blue"
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

                <section className="cadastro-card">
                    <div>
                        <div className="cadastro-subtitle">
                            COMECE AGORA - É GRÁTIS
                        </div>
                        <span className="cadastro-title">
                            Crie sua conta
                        </span>
                        <p>
                            Configure sua conta para acompanhar gastos, organizar seu orçamento e ter clareza total sobre suas finanças em um só lugar.
                        </p>



                        <form className="cadastro-form" onSubmit={handleSubmit}>
                            {error && (
                                <div style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
                                    {error}
                                </div>
                            )}
                            <label className="cadastro-label">
                                <span>NOME</span>
                                <input
                                    type="text"
                                    value={nome}
                                    placeholder=" Maria"
                                    onChange={(event) => setNome(event.target.value)}
                                    required
                                />
                            </label>

                            <label className="cadastro-label">
                                <span>SOBRENOME</span>
                                <input
                                    type="text"
                                    value={sobrenome}
                                    placeholder=" Silva"
                                    onChange={(event) => setSobrenome(event.target.value)}
                                    required
                                />
                            </label>

                            <label className="cadastro-label">
                                <span>EMAIL</span>
                                <input
                                    type="email"
                                    value={email}
                                    placeholder=" Mariasilva@email.com"
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                                <span>Enviaremos um link de confirmação para este endereço.</span>
                            </label>

                            <label className="cadastro-label">
                                <span>CPF</span>
                                <input
                                    type="text"
                                    value={cpf}
                                    placeholder="000.000.000-00"
                                    onChange={(event) => setCpf(event.target.value)}
                                    required
                                />
                                <span>Usado apenas para verificar sua identidade. Nunca compartilhado. </span>

                            </label>

                            <label className="cadastro-label">
                                <span>SENHA</span>
                                <input
                                    type="password"
                                    value={senha}
                                    placeholder="Digite aqui sua senha"
                                    onChange={(event) => setSenha(event.target.value)}
                                    required
                                />
                                <span>Use 8+ caracteres com um número e um símbolo.</span>
                            </label>

                            <label className="cadastro-label">
                                <span>CONFIRME A SENHA</span>
                                <input
                                    type="password"
                                    value={confirmarSenha}
                                    placeholder="Confirme aqui a sua senha"
                                    onChange={(event) => setConfirmarSenha(event.target.value)}
                                    required
                                />
                            </label>

                            <label className="confirmar-label">
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    value={aceitouTermos}
                                    onChange={(ev) => setAceitouTermos(ev.target.checked)}
                                />

                                <span className="checkbox-ui">
                                    {aceitouTermos && (
                                        <HugeiconsIcon
                                            icon={CheckIcon}
                                            size={14}
                                            color="var(--color-midnight-blue)"
                                            stroke="2"
                                        />
                                    )}
                                </span>

                                <span>
                                    Concordo com os <span className="link-destaque"> termos de serviço</span> e a <span className="link-destaque"> política de privacidade</span>
                                </span>
                            </label>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Cadastrando..' : 'Cadastrar'}
                            </button>

                        </form>
                        <footer className="cadastro-footer">
                            <p>Protegido por criptografia de 256 bits. Leia nossa política de dados.</p>
                            <p>Já tem uma conta? <Link to="/" className="link-destaque"> Entrar</Link></p>
                        </footer>

                    </div>
                </section>

            </div>
        </main>
    )



}


export default Cadastro