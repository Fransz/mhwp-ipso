import metadata from './block.json'

import icon from './icons';
import './mhwp-ipso-list.scss';

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import{ InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
    PanelBody,
    PanelRow,
    TextControl
} from '@wordpress/components';

registerBlockType( metadata, {
    icon: icon(),
    edit: ( props ) => {
        const blockProps = useBlockProps();

        return [
            <InspectorControls>
                <PanelBody title={ __( 'Basics', 'mhwp-ipso' )}>
                    <PanelRow>
                        <p>{ __( 'Configureer de IPSO agenda lijst hier.', 'mhwp-ipso' ) }</p>
                    </PanelRow>

                    <TextControl
                        value={ props.attributes.nr_days }
                        label={ __( 'Aantal dagen vooruit', 'mhwp-ipso' ) }
                        help={ __( 'Aantal dagen dat in de kalender getoond wordt.', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            if ( new_value === '' ) new_value = '10';

                            if (/^\d+$/.test(new_value)) {
                                props.setAttributes( { nr_days: new_value })
                            }
                        }}
                    />

                </PanelBody>
            </InspectorControls>,

            <div { ...blockProps } >
                <h4>IPSO agenda lijst</h4>
                <ul className="list-unstyled">
                    <li>
                        <span>{ __( 'Aantal dagen vooruit', 'mhwp-ipso' ) }: </span>
                        <span className="mhwp-ipso-nr-days">{ props.attributes.nr_days }</span>
                    </li>
                </ul>
            </div>
        ]
    },
    save: ({attributes}) => {
        const blockProps = useBlockProps.save();
        return (
            <div { ...blockProps } >
                <div id="mhwp-ipso-list-datepicker">
                    <input type="date" />
                </div>
                <div id="mhwp-ipso-list-container">
                    <input id="mhwp-ipso-list-nr-days" type="hidden" value={attributes.nr_days}/>
                </div>

            </div>
        )
    }
})
