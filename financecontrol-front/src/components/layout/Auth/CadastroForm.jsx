import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../../services/authService";
import { HugeiconsIcon, CheckIcon } from "../../../assets/icons";
import Modal from "../../common/Modal/Modal";
import TermosServico from "../../common/Legal/TermosServico";
import PoliticaPrivacidade from "../../common/Legal/PoliticaPrivacidade";
import Input from '../../common/Input/Input'
import Button from '../../common/Button/Button'


function CadastroForm() {
    const [nome, setNome] = useState("")
    const [sobrenome, setSobrenome] = useState("")
    const [email, setEmail] = useState("")
    const [cpf, setCpf] = useState("")
    const [telefone, setTelefone] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [aceitouTermos, setAceitouTermos] = useState(false)
    const [termosAberto, setTermosAberto] = useState(false)
    const [privacidadeAberta, setPrivacidadeAberta] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [sucesso, setSucesso] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")

        if (senha !== confirmarSenha) {
            setError("As senhas não correspondem.")
            return;
        }
        if (senha.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres')
            return;
        }
        if (!aceitouTermos) {
            setError("Você precisa concordar com os termos para continuar.")
            return;
        }

        setLoading(true);

        const dadosCadastro = {
            nome: `${nome} ${sobrenome}`.trim(),
            email,
            cpf,
            senha,
        };

        if (telefone.trim()) {
            dadosCadastro.telefone = telefone.trim()
        }

        try {
            await authService.register(dadosCadastro);
            setSucesso("Cadastro realizado com sucesso! Redirecionando...")

            setTimeout(() => {
                navigate("/login");
            }, 2000)
        } catch (err) {
            const message = err?.response?.data?.message || err?.message;
            setError(message || "Erro ao realizar cadastro. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="cadastro-subtitle">
                COMECE AGORA - É GRÁTIS
            </div>
            <span className="cadastro-title">
                Crie sua conta
            </span>
            <p className="cadastro-descricao">
                Configure sua conta para acompanhar gastos, organizar seu orçamento e ter clareza total sobre suas finanças em um só lugar.
            </p>

            <form className="cadastro-form" onSubmit={handleSubmit}>
                <Input
                    label={<>NOME <span className="obrigatorio">*</span></>}
                    id="nome"
                    type="text"
                    value={nome}
                    placeholder=" Maria"
                    onChange={(event) => setNome(event.target.value)}
                    required
                />

                <Input
                    label={<>SOBRENOME <span className="obrigatorio">*</span></>}
                    id="sobrenome"
                    type="text"
                    value={sobrenome}
                    placeholder=" Silva"
                    onChange={(event) => setSobrenome(event.target.value)}
                    required
                />

                <Input
                    label={<>EMAIL <span className="obrigatorio">*</span></>}
                    id="email"
                    type="email"
                    value={email}
                    placeholder=" Mariasilva@email.com"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <span>Enviaremos um link de confirmação para este endereço.</span>

                <Input
                    label={<>CPF <span className="obrigatorio">*</span></>}
                    id="cpf"
                    type="text"
                    value={cpf}
                    placeholder="000.000.000-00"
                    onChange={(event) => setCpf(event.target.value)}
                    required
                />
                <span>Usado apenas para verificar sua identidade. Nunca compartilhado.</span>

                <Input
                    label="TELEFONE"
                    id="telefone"
                    type="tel"
                    value={telefone}
                    placeholder="+55 (00) 00000-0000"
                    onChange={(event) => setTelefone(event.target.value)}
                />

                <Input
                    label={<>SENHA <span className="obrigatorio">*</span></>}
                    id="senha"
                    type="password"
                    value={senha}
                    placeholder="Digite aqui sua senha"
                    onChange={(event) => setSenha(event.target.value)}
                    required
                />
                <span>Use 8+ caracteres com um número e um símbolo.</span>

                <Input
                    label={<>CONFIRME A SENHA <span className="obrigatorio">*</span></>}
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    placeholder="Confirme aqui a sua senha"
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    required
                />

                <div className="confirmar-label">
                    <label>
                        <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={aceitouTermos}
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
                    </label>

                    <span>
                        Concordo com os{" "}
                        <span className="link-destaque" onClick={() => setTermosAberto(true)}>
                            termos de serviço
                        </span>
                        {" "}e a{" "}
                        <span className="link-destaque" onClick={() => setPrivacidadeAberta(true)}>
                            política de privacidade
                        </span>
                    </span>
                </div>

                {error && <div className="cadastro-error">{error}</div>}
                {sucesso && <div className="cadastro-sucess">{sucesso}</div>}

                <Button type="submit" variant="primary" fullWidth disabled={loading}>
                    {loading ? 'Cadastrando..' : 'Cadastrar'}
                </Button>
            </form>

            <footer className="cadastro-footer">
                <p>Protegido por criptografia de 256 bits. Leia nossa política de dados.</p>
                <p>Já tem uma conta? <Link to="/" className="link-destaque">Entrar</Link></p>
            </footer>


            <Modal isOpen={termosAberto} onClose={() => setTermosAberto(false)} title="Termos de Serviço">
                <TermosServico />
            </Modal>

            <Modal isOpen={privacidadeAberta} onClose={() => setPrivacidadeAberta(false)} title="Política de Privacidade">
                <PoliticaPrivacidade />
            </Modal>
        </div>
    )
}

export default CadastroForm