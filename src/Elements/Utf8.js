/**
 * Utilitary methods to encode and decode strings in utf-8 format.
 * @class
 * @category elements
 */
    class Utf8 {
        /**
         * Encode a string into an array of bytes.
         * This method use the fact that URI escape special characters by using the following format '%XX' where 'XX' is a utf-8 byte.
         * @param {String} str - String to encode
         * @return {Number[]} Array of bytes
         */
            static encode(str) {
                let bytes = []
                ;([...str]).map(char => bytes.push(...[...Utf8._encode(char)].map(c => c.charCodeAt(0))))
                return bytes
            }

        /**
         * Encode utilitary method.
         * @private
         * @ignore
         */
            static _encode(char) { return unescape(encodeURIComponent(char)) }

        /**
         * Decode bytes into a string.
         * This method use the fact that URI escape special characters by using the following format '%XX' where 'XX' is a utf-8 byte.
         * @param {Number[]} [bytes=[]] - Array of bytes
         * @return {String} Decoded string
         */
            static decode(bytes = []) {
                let str = ""
                for (let i = 0; i < bytes.length; i++) {
                         if ((bytes[i] & 0b10000000) === 0b00000000) { str += Utf8._decode(String.fromCharCode(bytes[i])) }
                    else if ((bytes[i] & 0b11100000) === 0b11000000) { str += Utf8._decode(String.fromCharCode(bytes[i], bytes[++i])) }
                    else if ((bytes[i] & 0b11110000) === 0b11100000) { str += Utf8._decode(String.fromCharCode(bytes[i], bytes[++i], bytes[++i])) }
                    else if ((bytes[i] & 0b11111000) === 0b11110000) { str += Utf8._decode(String.fromCharCode(bytes[i], bytes[++i], bytes[++i], bytes[++i])) }
                }
                return str
            }

        /**
         * Decode utilitary method.
         * @private
         * @ignore
         */
            static _decode(byte) { try { return decodeURIComponent(escape(byte)) } catch (e) { return "�" } }
    }
