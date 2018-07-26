import React, {Component} from 'react';

export default class Processing extends Component {

    render() {
        return (
            <div className={'contentCenter'}>
                <p className={'title'}>Processing...</p>
                <div className={'loadingContainer loadingHeight'}>
                    <div className={'loading'}>
                        <img alt='idscango' className={'loadingIcon'} src={require('../assets/images/loader@3x.png')}/>
                    </div>
                </div>
            </div>
        )
    }
}