/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable'

// https://github.com/testing-library/jest-dom#table-of-contents
import '@testing-library/jest-dom'

// https://stackoverflow.com/a/68468204/1332513
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
