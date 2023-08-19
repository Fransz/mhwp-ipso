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
                <div id="mhwp-ipso-message"></div>


                    {dateInput(attributes.activity_date)}
                    {idInput(attributes.activity_id)}
                    {titleInput(attributes.activity_title)}

                    <button className="mhwp-ipso-reservation-show-reservation mhwp-ipso-reservation-button " type="button"
                            data-toggle="collapse" data-target="#mhwp-ipso-collapse-reservation"
                            aria-expanded="false" aria-controls="mhwp-ipso-collapse-reservation">
                        Reserveer
                    </button>

            </div>
        )
    }
})
