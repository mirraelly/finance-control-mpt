import React from 'react';
import { HugeiconsIcon, TradeUpIcon, Search01Icon, Notification01Icon } from "../../../assets/icons";
import './Header.css'
import Button from '../../common/Button';

function Header({ title = "Início" }) {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    return (
        <header className='header-container'>
            {/* Lado Esquerdo (Ícone, Titulo, Data)*/}
            <div className='header-left'>
                <div className='title-icon-wrapper'>
                    <div className='header-trend-icon'>
                        {/* Ícone de gráfico ou Zap, em verde */}
                        <HugeiconsIcon icon={TradeUpIcon} size={20} color='#00b074' />
                    </div>
                    <div className='title-date-group'>
                        <h1 className='header-title'>{title}</h1>
                        <span className='header-date'>{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/*Lado Direito (Busca e Controles, Empilhados) */}
            <div className='header-right-group'>
                {/*Barra de Busca(acima)*/}
                <div className='search-box'>
                    <HugeiconsIcon icon={Search01Icon} size={18} className="search-icon" />
                    <input type="text" placeholder='Buscar transações...' />
                </div>

                <div className='controls-box'>
                    <Button className='btn-transaction'>
                        <span className='plus-icon'>+</span> Transação
                    </Button>

                    <Button className='btn-icon'>
                        <HugeiconsIcon icon={Notification01Icon} size={20}/>
                        <span className='notification-badge'></span>
                    </Button>

                    <div className='avatar'>
                        <span>JV</span>{/*Iniciais dinamicas futuramente*/}
                    </div>
                   
                </div>
            </div>
        </header>
    )
}

export default Header;