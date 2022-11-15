// import './mhwp-ipso-list-frontend.js'
// import './bootstrap-collapse.js'

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
    edit: ( props ) => {
        const blockProps = useBlockProps();

        return [
            <InspectorControls>
                <PanelBody title={ __( 'Basics', 'mhwp-ipso' )}>
                    <PanelRow>
                        <p>{ __( 'Configure the ipso button here.', 'mhwp-ipso' ) }</p>
                    </PanelRow>

                    <DatePicker
                        label={ __( 'De datum van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De datum van de activiteit', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            props.setAttributes( { activity_date: new_value })
                        }} />

                    <TextControl
                        value={ props.attributes.activity_title }
                        label={ __( 'De naam van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De datum van de activiteit, precies zo als in het IPSO systeem', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            props.setAttributes( { activity_title: new_value })
                        }} />

                    <TextControl
                        value={ props.attributes.activity_id }
                        label={ __( 'De id van de activiteit', 'mhwp-ipso' ) }
                        help={ __( 'De id van de activiteit, precies zo als in het IPSO system', 'mhwp-ipso' ) }
                        onChange={ (  new_value  ) => {
                            if (/^\d*$/.test(new_value)) {
                                props.setAttributes({activity_id: new_value})
                            }
                        }} />

                </PanelBody>
            </InspectorControls>,

            <div { ...blockProps } >
                <h4>IPSO Agenda Block</h4>
                <ul className="list-unstyled">
                    <li>
                        <strong>{ __( 'XXXX Aantal dagen vooruit', 'mhwp-ipso' ) }: </strong>
                        <span className="mhwp-ipso-nr-days">{ props.attributes.nr_days }</span>
                    </li>
                </ul>
            </div>
        ]
    },
    save: ({attributes}) => {
        const blockProps = useBlockProps.save();

        const dateInput = ({activity_date}) => {
            if (activity_date) {
                const d = new Date(activity_date);
                return <input type="hidden" name="activity-date" id="mhwp-activity-date"
                              value={`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`} />
            } else {
                return null;
            }
        }
        const idInput = ({activity_id}) => {
            if (activity_id !== '' && activity_id !== '0') {
                return <input type="hidden" name="activity_id" id="mhwp-activity-id" value={activity_id}/>
            } else {
                return null;
            }
        }
        const titleInput = ({activity_title}) => {
            if (activity_title) {
                return <input type="hidden" name="activity-title" id="mhwp-activity-title" value={activity_title} />
            } else {
                return null;
            }
        }
        // Calculate correct hidden properties here, put them in the form, for filtering on the server.
        // => Calculate correct hidden properties here, for filtering in the client.
        return (
            <div { ...blockProps } >
                <div id="mhwp-ipso-button-container">

                    {dateInput(attributes)}
                    {idInput(attributes)}
                    {titleInput(attributes)}

                    <form className={"mhwp_reserveer_button"}>
                        <div></div>
                        <div>
                            <fieldset>
                                <label htmlFor="mhwp_ipso_voornaam">Voornaam</label>
                                <span className="required">*</span>
                                <input type="text" id="mhwp_ipso_voornaam" name="firstName" required placeholder="" />
                            </fieldset>
                            <fieldset>
                                <label htmlFor="mhwp_ipso_tussenvoegsel">Tussenvoegsel</label>
                                <input type="text" id="mhwp_ipso_tussenvoegsel" name="lastNamePrefix" placeholder="" />
                            </fieldset>
                            <fieldset>
                                <label htmlFor="mhwp_ipso_achternaam">Achternaam</label>
                                <span className="required">*</span>
                                <input type="text" id="mhwp_ipso_achternaam" name="lastName" required placeholder="" />
                            </fieldset>
                        </div>

                        <div>
                            <fieldset>
                                <label htmlFor="mhwp_ipso_telefoon">Telefoonnummer</label>
                                <input type="tel" id="mhwp_ipso_telefoon" name="phoneNumber" placeholder="" />
                                <span className="validity"></span>
                            </fieldset>
                            <fieldset>
                                <label htmlFor="mhwp_ipso_email">Emailadres</label>
                                <span className="required">*</span>
                                <input type="email" id="mhwp_ipso_email" name="email" required placeholder="" />
                                <span className="validity"></span>
                            </fieldset>
                            <div>
                                <button type="submit">Reserveer</button>
                            </div>
                        </div>
                    </form>
                    <button />
                </div>

            </div>
        )
    }
})
