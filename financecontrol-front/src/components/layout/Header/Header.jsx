import React from 'react';
import { HugeiconsIcon, TradeUpIcon, Search01Icon, Notification01Icon } from "../../../assets/icons";
import './Header.css';
import Button from '../../common/Button';
import Input from '../../common/Input';

function Header({ title = "Início" }) {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

    
    const handleNewTransaction = () => {
        
        console.log("Abrir modal de nova transação");
    };

    const handleNotifications = () => {
        
        console.log("Abrir painel de notificações");
    };

    return (
        <header className='header-container'>
            <div className='header-left'>
                <div className='title-icon-wrapper'>
                    <div className='header-trend-icon'>
                        <HugeiconsIcon icon={TradeUpIcon} size={20} color='#00b074' />
                    </div>
                    <div className='title-date-group'>
                        <h1 className='header-title'>{title}</h1>
                        <span className='header-date'>{formattedDate}</span>
                    </div>
                </div>
            </div>

            <div className='header-right-group'>
                <Input
                    className="header-search"
                    theme="dark"
                    shadow={false}
                    icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
                    placeholder="Buscar transações..."
                />

                <div className='controls-box'>
                    
                    <Button size='md' variant='primary' onClick={handleNewTransaction}>
                        <span className='plus-icon'>+</span> Transação
                    </Button>

                    <Button className='btn-icon' size='md' onClick={handleNotifications}>
                        <HugeiconsIcon icon={Notification01Icon} size={20} />
                        <span className='notification-badge'></span>
                    </Button>

                    <div className='avatar'>
                        <span>MS</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;