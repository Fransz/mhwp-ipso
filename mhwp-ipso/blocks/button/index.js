import metadata from './block.json'

import icon from './icons';
import './mhwp-ipso-button.scss';

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
    edit: ( {attributes, setAttributes} ) => {
        const blockProps = useBlockProps();

        return [
            <InspectorControls>
                <PanelBody title={ __( 'Basics', 'mhwp-ipso' )}>
                    <PanelRow>
                        <p>{ __( 'Configureer de ipso knop hier.', 'mhwp-ipso' ) }</p>
                    </PanelRow>

                    <TextControl
                        value={ attributes.activity_id }
                        label={ __( 'De id van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De id van de activiteit (actvityId) uit het IPSO system', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            if (/^\d*$/.test(new_value)) {
                                setAttributes({activity_id: new_value})
                            }
                        }}
                    />
                </PanelBody>
            </InspectorControls>,

            <div { ...blockProps } >
                <div id="mhwp-ipso-backend">
                    <h4>IPSO agenda knop</h4>
                    <h4 id="mhwp-ipso-backend-activityid">
                        { __( 'Activiteit Id', 'mhwp-ipso' ) }:&nbsp;{ attributes.activity_id }
                    </h4>
                </div>
            </div>
        ]
    },
    save: ({attributes}) => {
        const blockProps = useBlockProps.save();

        return (
            <div { ...blockProps } >


                <input type="hidden" name="activity-id" id="mhwp-ipso-button-activityid" value={attributes.activity_id}/>

                <div id="mhwp-ipso-button">
                    <button id="mhwp-ipso-button-more" type="button">
                        Reserveer
                    </button>
                </div>

                <div id="mhwp-ipso-modal-box" className="mhwp-ipso-modal-box" role="dialog" tabIndex="-1">
                    <div id="mhwp-ipso-box-inner" className="mhwp-ipso-modal-box" role="dialog" tabIndex="-1">
                        <div id="mhwp-ipso-box-titlerow" className="mhwp-ipso-box-row">
                            <img id="mhwp-ipso-box-image" src="" alt="" />
                            <div id="mhwp-ipso-box-title"></div>
                            <button id="mhwp-ipso-box-close" aria-label="Close">&times;</button>
                        </div>
                        <div id="mhwp-ipso-box-rulerrow" className="mhwp-ipso-box-row">
                            <hr />
                        </div>

                        <div id="mhwp-ipso-box-contentrow" className="mhwp-ipso-box-row">
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
        )
    }
})
