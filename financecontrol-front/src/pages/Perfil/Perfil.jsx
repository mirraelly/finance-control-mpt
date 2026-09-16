import { useState, useEffect } from "react";
import usuarioService from '../../services/usuarioService';
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Modal from "../../components/common/Modal/Modal";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Call02Icon, Mail01Icon } from "../../assets/icons";
import "./Perfil.css";

function formatarMesAno(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    const texto = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Perfil() {
    const [usuario, setUsuario] = useState({
        id: "123e4567-e89b-12d3-a456-426614174000",
        tenantId: "987e6543-e21b-12d3-a456-426614174000",
        nome: "Maria Silva",
        email: "maria@email.com",
        telefone: "11 988221043",
        codigoPais: "55",
        role: "USER",
        ativo: true,
        createdAt: "2024-03-10",
        updatedAt: "2024-03-10",
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [deletando, setDeletando] = useState(false);
    
    const [modalAberto, setModalAberto] = useState(false);
    const [modalDeletarAberto, setModalDeletarAberto] = useState(false);

    const [nomeEditado, setNomeEditado] = useState("");
    const [telefoneEditado, setTelefoneEditado] = useState("");
    const [codigoPaisEditado, setCodigoPaisEditado] = useState("");

    useEffect(() => {
        async function carregarDadosDoPerfil() {
            try {
                setCarregando(true);
                const userId = localStorage.getItem('userId');

                if (userId) {
                    const dadosReais = await usuarioService.buscarUsuarioPorId(userId);
                    setUsuario(dadosReais);
                }
            } catch (erro) {
                console.error("Erro ao carregar dados do perfil:", erro);
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosDoPerfil();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/";
    };

    const abrirModalEdicao = () => {
        setNomeEditado(usuario.nome || "");
        setTelefoneEditado(usuario.telefone || "");
        setCodigoPaisEditado(usuario.codigoPais || "");
        setModalAberto(true);
    };

    const handleSalvar = async (event) => {
        event.preventDefault();

        if (!nomeEditado.trim() || nomeEditado.trim().length < 3) {
            alert("Por favor, informe um nome válido com pelo menos 3 caracteres.");
            return;
        }

        const usuarioUpdateDto = {
            nome: nomeEditado,
            telefone: telefoneEditado,
            codigoPais: codigoPaisEditado,
            ativo: usuario.ativo,
            role: usuario.role,
        };

        try {
            setSalvando(true);
            const userId = localStorage.getItem("userId");

            if (userId) {
                const usuarioAtualizado = await usuarioService.atualizarUsuario(userId, usuarioUpdateDto);
                setUsuario(usuarioAtualizado);
            }

            setModalAberto(false);
        } catch (erro) {
            console.error("Erro ao atualizar perfil:", erro);
            alert("Não foi possível salvar as alterações. Tente novamente.");
        } finally {
            setSalvando(false);
        }
    };

    const handleDeletarConta = async () => {
        try {
            setDeletando(true);
            const userId = localStorage.getItem("userId");

            if (userId) {
                await usuarioService.deletarUsuario(userId);
            }

            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.href = "/";
        } catch (erro) {
            console.error("Erro ao deletar conta:", erro);
            alert("Não foi possível excluir sua conta. Tente novamente.");
            setDeletando(false);
        }
    };

    const iniciais = (usuario.nome || "")
        .split(" ")
        .filter(Boolean)
        .map((parte) => parte[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (carregando) {
        return (
            <main className="perfil-page">
                <div className="perfil-container">
                    <p style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>
                        Carregando dados do perfil...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="perfil-page">
            <header className="perfil-topo">
                <div className="perfil-brand">
                    <div className="perfil-logo">↗</div>
                    <span className="perfil-brand-nome">
                        Finance Control <span className="perfil-brand-tag">MPT</span>
                    </span>
                </div>
            </header>

            <div className="perfil-container">
                <Card className="perfil-header-card">
                    <div className="perfil-avatar">{iniciais}</div>

                    <div className="perfil-header-info">
                        <h1 className="perfil-nome">{usuario.nome}</h1>
                        <div className="perfil-contato">
                            <span className="perfil-contato-item">
                                <span className="perfil-icone">
                                    <HugeiconsIcon icon={Mail01Icon} size={16} />
                                </span>
                                {usuario.email}
                            </span>
                            <span className="perfil-contato-item">
                                <span className="perfil-icone">
                                    <HugeiconsIcon icon={Call02Icon} size={16} />
                                </span>
                                +{usuario.codigoPais} {usuario.telefone}
                            </span>
                            <span className="perfil-contato-item">
                                <span className="perfil-icone">
                                    <HugeiconsIcon icon={Calendar03Icon} size={16} />
                                </span>
                                Conta desde {formatarMesAno(usuario.createdAt)}
                            </span>
                        </div>
                    </div>

                    <Button variant="primary" onClick={abrirModalEdicao}>
                        Editar perfil
                    </Button>
                </Card>

                <Card className="perfil-info-card">
                    <h2 className="perfil-secao-titulo">Informações da conta</h2>
                    <p className="perfil-secao-descricao">
                        Dados principais do seu perfil. O e-mail não pode ser alterado por aqui.
                    </p>

                    <div className="perfil-info-grid">
                        <div className="perfil-info-item">
                            <div className="perfil-info-icon-wrapper">
                                <HugeiconsIcon icon={Mail01Icon} size={20} />
                            </div>
                            <div className="perfil-info-detalhes">
                                <span className="perfil-info-label">E-mail</span>
                                <span className="perfil-info-valor">{usuario.email}</span>
                            </div>
                        </div>

                        <div className="perfil-info-item">
                            <div className="perfil-info-icon-wrapper">
                                <HugeiconsIcon icon={Call02Icon} size={20} />
                            </div>
                            <div className="perfil-info-detalhes">
                                <span className="perfil-info-label">Telefone</span>
                                <span className="perfil-info-valor">
                                    +{usuario.codigoPais} {usuario.telefone}
                                </span>
                            </div>
                        </div>

                        <div className="perfil-info-item perfil-info-item-full">
                            <div className="perfil-info-icon-wrapper">
                                <HugeiconsIcon icon={Calendar03Icon} size={20} />
                            </div>
                            <div className="perfil-info-detalhes">
                                <span className="perfil-info-label">Membro desde</span>
                                <span className="perfil-info-valor">
                                    {formatarMesAno(usuario.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="perfil-info-item">
                            <div className="perfil-info-detalhes">
                                <span className="perfil-info-label">Perfil de acesso</span>
                                <span className="perfil-info-valor">{usuario.role}</span>
                            </div>
                        </div>

                        <div className="perfil-info-item">
                            <div className="perfil-info-detalhes">
                                <span className="perfil-info-label">Status da conta</span>
                                <span className="perfil-info-valor">
                                    {usuario.ativo ? "Ativa" : "Inativa"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="perfil-logout-container" style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", display: "flex", gap: "1rem" }}>
                        <Button variant="secondary" onClick={handleLogout}>
                            Sair
                        </Button>
                        <Button variant="danger" onClick={() => setModalDeletarAberto(true)}>
                            Excluir conta
                        </Button>
                    </div>
                </Card>

                <Card className="perfil-em-breve">
                    <span className="perfil-em-breve-icone">⏱</span>
                    <h3 className="perfil-em-breve-titulo">Mais informações em breve</h3>
                    <p className="perfil-em-breve-texto">
                        Saldo, investimentos, metas financeiras e configurações de
                        segurança estarão disponíveis em breve.
                    </p>
                </Card>
            </div>

            <Modal
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                title="Editar perfil"
                theme="dark"
                className="perfil-modal"
            >
                <p className="perfil-modal-subtitulo">
                    Atualize seu nome e telefone de contato.
                </p>

                <form className="perfil-form" onSubmit={handleSalvar}>
                    <Input
                        label="NOME"
                        id="perfil-nome"
                        type="text"
                        value={nomeEditado}
                        onChange={(event) => setNomeEditado(event.target.value)}
                        required
                    />

                    <div className="perfil-form-row">
                        <Input
                            label="CÓDIGO DO PAÍS"
                            id="perfil-codigo-pais"
                            type="text"
                            value={codigoPaisEditado}
                            onChange={(event) => setCodigoPaisEditado(event.target.value)}
                        />

                        <Input
                            label="TELEFONE"
                            id="perfil-telefone"
                            type="tel"
                            value={telefoneEditado}
                            onChange={(event) => setTelefoneEditado(event.target.value)}
                        />
                    </div>

                    <div className="perfil-form-email">
                        <div>
                            <span className="perfil-form-email-label">E-mail: </span>
                            <span className="perfil-form-email-valor">{usuario.email}</span>
                        </div>
                        <span className="perfil-form-email-aviso">
                            O e-mail não pode ser alterado por aqui.
                        </span>
                    </div>

                    <div className="perfil-form-botoes">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setModalAberto(false)}
                            disabled={salvando}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={salvando}>
                            {salvando ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={modalDeletarAberto}
                onClose={() => setModalDeletarAberto(false)}
                title="Excluir Conta"
                theme="dark"
            >
                <p style={{ color: "#fff", marginBottom: "1.5rem" }}>
                    Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão apagados.
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                    <Button
                        variant="secondary"
                        onClick={() => setModalDeletarAberto(false)}
                        disabled={deletando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeletarConta}
                        disabled={deletando}
                    >
                        {deletando ? "Excluindo..." : "Confirmar Exclusão"}
                    </Button>
                </div>
            </Modal>
        </main>
    );
}

export default Perfil;