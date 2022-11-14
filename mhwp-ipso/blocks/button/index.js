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
                            console.log(new_value);
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
        // Calculate correct hidden properties here, put them in the form, for filtering on the server.
        // Calculate correct hidden properties here, for filtering in the client.
        return (
            <div { ...blockProps } >
                <div id="mhwp-ipso-button-container">

                    <form>
                        <input type="hidden" name="activity_id" id="activity_id" value={attributes.activity_id} />
                        <input type="hidden" name="activity_date" id="activity_date" value={attributes.activity_date} />
                        <input type="hidden" name="activity_title" id="activity_title" value={attributes.activity_title} />

                        <div>
                            <fieldset>
                                <label for="mhwp_ipso_voornaam_${cnt}">Voornaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp_ipso_voornaam_${cnt}" name="firstName" required placeholder="" />
                            </fieldset>
                            <fieldset>
                                <label for="mhwp_ipso_tussenvoegsel_${cnt}">Tussenvoegsel</label>
                                <input type="text" id="mhwp_ipso_tussenvoegsel_${cnt}" name="lastNamePrefix" placeholder="" />
                            </fieldset>
                            <fieldset>
                                <label for="mhwp_ipso_achternaam_${cnt}">Achternaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp_ipso_achternaam_${cnt}" name="lastName" required placeholder="" />
                            </fieldset>
                        </div>

                        <div>
                            <fieldset>
                                <label for="mhwp_ipso_telefoon_${cnt}">Telefoonnummer</label>
                                <input type="tel" id="mhwp_ipso_telefoon_${cnt}" name="phoneNumber" placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <fieldset>
                                <label for="mhwp_ipso_email_${cnt}">Emailadres</label>
                                <span class="required">*</span>
                                <input type="email" id="mhwp_ipso_email_${cnt}" name="email" required placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <div class="col-md-4">
                                <button type="submit" autocomplete="off">Reserveer</button>
                            </div>
                        </div>
                    </form>
                    <button />
                </div>

            </div>
        )
    }
})
