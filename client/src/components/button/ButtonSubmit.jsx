import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import Spinner from 'react-bootstrap/Spinner'
import { BUTTON_STATE } from "../../utils";

function ButtonSubmit({ buttonState, resetState, title }) {

    if (buttonState === BUTTON_STATE.DISABLE) return (
        <button className='btn btn-primary fw-bold px-5' type='submit' disabled>{title}</button>
    )

    if (buttonState === BUTTON_STATE.ENABLE) return (
        <button className='btn btn-primary fw-bold px-5' type='submit'>{title}</button>
    )

    if (buttonState === BUTTON_STATE.PENDING) return (
        <button className='btn btn-secondary fw-bold px-5' type='submit' disabled>
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            /> { } Pending...
        </button>
    )

    if (buttonState === BUTTON_STATE.DONE) return (
        <button className='btn btn-primary fw-bold px-5' type='button' onClick={resetState}>
            <FontAwesomeIcon icon={faCheckCircle} /> { } Done
        </button>
    )

    if (buttonState === BUTTON_STATE.REJECTED) return (
        <button className='btn btn-danger fw-bold px-5' type='button' onClick={resetState}>
            <FontAwesomeIcon icon={faExclamationCircle} /> { } Rejected
        </button>
    )

    return (<button className='btn btn-primary fw-bold px-5' type='submit' disabled>{title}</button>)
}

export { ButtonSubmit }