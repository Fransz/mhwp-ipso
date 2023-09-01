import metadata from './block.json'

import './mhwp-ipso-button.scss';

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import{ InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
    DatePicker,
    PanelBody,
    PanelRow,
    TextControl
} from '@wordpress/components';

registerBlockType( metadata, {
    icon: 'smiley',
    edit: ( {attributes, setAttributes} ) => {
        const blockProps = useBlockProps();

        const formatDate = (d) => {
            if (! d) {
                return '';
            }
            const day = new Date(d);
            return `${day.getDate()}-${day.getMonth() + 1}-${day.getFullYear()}`
        }

        return [
            <InspectorControls>
                <PanelBody title={ __( 'Basics', 'mhwp-ipso' )}>
                    <PanelRow>
                        <p>{ __( 'Configureer de ipso knop hier.', 'mhwp-ipso' ) }</p>
                    </PanelRow>

                    <DatePicker
                        label={ __( 'De datum van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De datum van de activiteit', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            setAttributes({activity_date: new_value})
                        }}
                        currentDate={ attributes.activity_date }
                    />

                    <TextControl
                        value={ attributes.activity_title }
                        label={ __( 'De naam van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De naam van de activiteit, precies zo als in het IPSO systeem', 'mhwp-ipso' ) }
                        onChange={ (new_value) => {
                            setAttributes({activity_title: new_value})
                        }}
                    />

                    <TextControl
                        value={ attributes.activity_id }
                        label={ __( 'De agenda id van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De agenda id van de activiteit, precies zo als in het IPSO system', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            if (/^\d*$/.test(new_value)) {
                                setAttributes({activity_id: new_value})
                            }
                        }}
                    />
                </PanelBody>
            </InspectorControls>,

            <div { ...blockProps } >
                <h4>IPSO agenda knop</h4>
                <ul className="list-unstyled">
                    <li>
                        <span>{ __( 'Datum', 'mhwp-ipso' ) }: </span>
                        <span>{ formatDate(attributes.activity_date) }</span>
                    </li>
                    <li>
                        <span>{ __( 'Id', 'mhwp-ipso' ) }: </span>
                        <span>{ attributes.activity_id }</span>
                    </li>
                    <li>
                        <span>{ __( 'Title', 'mhwp-ipso' ) }: </span>
                        <span>{ attributes.activity_title }</span>
                    </li>
                </ul>
            </div>
        ]
    },
    save: ({attributes}) => {
        const blockProps = useBlockProps.save();

        const dateInput = (activity_date) => {
            if (activity_date) {
                return <input type="hidden" name="activity-date" id="mhwp-activity-date"
                              value={activity_date} />
            } else {
                return null;
            }
        }
        const idInput = (activity_id) => {
            if (activity_id !== '' && activity_id !== '0') {
                return <input type="hidden" name="activity-id" id="mhwp-activity-id" value={activity_id}/>
            } else {
                return null;
            }
        }
        const titleInput = (activity_title) => {
            if (activity_title) {
                return <input type="hidden" name="activity-title" id="mhwp-activity-title" value={activity_title} />
            } else {
                return null;
            }
        }

        return (
            <div { ...blockProps } >


                {dateInput(attributes.activity_date)}
                {idInput(attributes.activity_id)}
                {titleInput(attributes.activity_title)}

                <div id={"mhwp-ipso-button"}>
                    <button id="mhwp-ipso-button-more" type="button">
                        Reserveer
                    </button>
                    <div id="mhwp-ipso-button-message"></div>
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
