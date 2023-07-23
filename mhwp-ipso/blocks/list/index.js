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

                <template id="mhwp-ipso-month-card">
                    <li className="mhwp-ipso-month-card">
                        <div className="mhwp-ipso-card-title"></div>
                        <div className="mhwp-ipso-card-daterow">
                            <span className="mhwp-ipso-card-date"></span>
                            <span className="mhwp-ipso-card-time"></span>
                        </div>
                        <div className="mhwp-ipso-card-buttonrow">
                        <button className="mhwp-ipso-show-detail" type="button">
                            Lees meer
                        </button>
                        </div>
                    </li>
                </template>


                <div id="mhwp-ipso-list-weekpicker">
                    <div id="mhwp-ipso-current-week">21 januari- 28 januari</div>
                    <button id="mhwp-ipso-prev-week">vorige week</button>
                    <button id="mhwp-ipso-next-week">volgende week</button>
                </div>
                <div id="mhwp-ipso-box-container">
                    <div id="mhwp-ipso-modal-box" className="mhwp-ipso-modal-box" role="dialog" tabIndex="-1">
                        <div id="mhwp-ipso-box-inner" className="mhwp-ipso-modal-box" role="dialog" tabIndex="-1">
                            <div id="mhwp-ipso-box-titlerow" className="mhwp-ipso-box-row">
                                <div id="mhwp-ipso-box-title"></div>
                                <button id="mhwp-ipso-box-close" aria-label="Close">&times;</button>
                            </div>
                            <div id="mhwp-ipso-box-daterow" className="mhwp-ipso-box-row">
                                <div id="mhwp-ipso-box-date"></div>
                                <div id="mhwp-ipso-box-items"></div>
                            </div>
                            <div id="mhwp-ipso-box-rulerrow" className="mhwp-ipso-box-row">
                                <hr />
                            </div>

                            <div id="mhwp-ipso-box-contentrow" className="mhwp-ipso-box-row">
                                <div id="mhwp-ipso-box-contentcolumn" className="mhwp-ipso-box-column">
                                    <div id="mhwp-ipso-box-introrow" className="mhwp-ipso-box-row">
                                        <img id="mhwp-ipso-box-image" src="" alt="" />
                                        <div id="mhwp-ipso-box-intro"></div>
                                    </div>
                                    <div id="mhwp-ipso-box-description"></div>
                                    <div id="mhwp-ipso-box-directbutton">
                                        <button className="mhwp-ipso-activity-submit-reservation" type="submit" autocomplete="off">Reserveer</button>
                                    </div>
                                </div>

                                <div id="mhwp-ipso-box-formcolumn" className="mhwp-ipso-box-column">
                                    <form id="mhwp-ipso-box-form">
                                            <fieldset className="mhwp-ipso-res-items">
                                            </fieldset>
                                            <fieldset className="mhwp-ipso-res-firstname">
                                                <label htmlFor="mhwp-ipso-res-firstname">Voornaam</label>
                                                <span className="required">*</span>
                                                <input type="text" id="mhwp-ipso-res-firstname" name="firstName"
                                                       required placeholder="" />
                                            </fieldset>
                                            <fieldset className="mhwp-ipso-res-prefix">
                                                <label htmlFor="mhwp-ipso-res-prefix">Tussenvoegsel</label>
                                                <input type="text" id="mhwp-ipso-res-prefix" name="lastNamePrefix"
                                                       placeholder="" />
                                            </fieldset>
                                            <fieldset className="mhwp-ipso-res-lastname">
                                                <label htmlFor="mhwp-ipso-res-lastname">Achternaam</label>
                                                <span className="required">*</span>
                                                <input type="text" id="mhwp-ipso-res-lastname" name="lastName" required
                                                       placeholder="" />
                                            </fieldset>
                                            <fieldset className="mhwp-ipso-res-telephone">
                                                <label htmlFor="mhwp-ipso-res-telephone">Telefoonnummer</label>
                                                <input type="tel" id="mhwp-ipso-res-telephone" name="phoneNumber"
                                                       placeholder="" />
                                                <span className="validity"></span>
                                            </fieldset>
                                            <fieldset className="mhwp-ipso-res-email">
                                                <label htmlFor="mhwp-ipso-res-email">Emailadres</label>
                                                <span className="required">*</span>
                                                <input type="email" id="mhwp-ipso-res-email" name="email" required
                                                       placeholder="" />
                                                <span className="validity"></span>
                                            </fieldset>
                                            {
                                                // @see https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing
                                            }
                                            <button className="mhwp-ipso-activity-submit-reservation" type="submit" autocomplete="off">Reserveer</button>
                                    </form>
                                </div>
                            </div>
                            <div id="mhwp-ipso-box-messagerow" className="mhwp-ipso-box-row"></div>
                        </div>
                    </div>
                </div>

                <input id="mhwp-ipso-list-nr-days" type="hidden" value={attributes.nr_days}/>
                <ul id="mhwp-ipso-month-container"></ul>
            </div>
        )
    }
})
