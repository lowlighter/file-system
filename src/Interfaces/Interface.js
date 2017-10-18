class Interface {
    /**
     * Create an user interface to handle Image disks.
     * @param {Image} image - Used image disk
     * @param {DOMElement} context - Context
     * @param {Boolean} [init=false] - Initialize image with default files
     * @category interfaces
     */
        constructor(image, context, init = false) {
            this.context = $(context)
            this.image = image
            if (init) { this.init() }
            Interface.LAST_INSTANCE = this
        }

    /**
     * List entries in folder.
     * @param {Number} folder - Folder id
     * @return {Entry[]} Entries contained in folder
     */
        entries(folder) {
            this.image.sync(1)
            this.image.sync(false)
            let files = []
            for (let i = 1; i <= this.image.table_size; i++) {
                let f = this.image.entry(i)
                if ((!f.blank)&&(f.parent.id === folder)) { files.push(f) }
            }
            this.image.sync(true)
            return files
        }

    /**
     * Create a new entry.
     * @param {Object} entry - Entry data
     * @return {Number} Created entry id
     */
        create(entry) {
            //Initialization
                let f = this.image.entry_unused
                f.blank = false
            //Update dates and permissions
                if (this.image.table_extended) {
                    let d = new Date()
                    f.edition = f.creation = {y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate(), h:d.getHours(), i:d.getMinutes(), s:d.getSeconds()}
                    f.permissions =  {u:{r:1, w:1, x:1, d:1}, o:{r:1, w:0, x:1, d:0}}
                }
            //Sync data
                f.data = entry
                return f.id
        }

    /**
     * <pre>
     * Parse a path into an entry identifiant.
     * </pre>
     * @param {String} path - Path to parse
     * @param {Boolean} [type=Entry.FOLDER] Type of entry to get at the end
     * @param {String} [pwd=""] - Current directory path
     * @return {Number} Entry id
     * @throws {Error} ENOENT
     */
        path(path, type = Entry.FOLDER, pwd = "") {
            //Initialization
                let dir = Entry.ROOT
                if (/^\.\//.test(path)) { path = `/${pwd}/${path.replace(/^\.\//, "")}/` }
                let seg = `${path.charAt(0) === "/" ? "" : pwd}/${path}`.split("/").filter(p => p.length)
                this.image.sync(1)
                this.image.sync(false)
            //Parse path
                for (let i = 0; i < seg.length; i++) {
                    //Moving up
                        if (seg[i] === "..") {
                            if (dir !== Entry.ROOT) { dir = this.image.entry(dir).parent.id }
                            continue
                        }
                    //Search entry name in current directory
                        let entries = this.entries(dir).filter(entry => ((i < seg.length-1)&&(entry.folder))||((i === seg.length-1)&&(entry.type === type)))
                        let names = entries.map(entry => entry.name), j = names.indexOf(seg[i])
                    //Moving down
                        if (j >= 0) { dir = entries[j].id } else { throw new Error(`ENOENT : ${path.charAt(0) === "/" ? "" : pwd}/${path}`) }
                }
                this.image.sync(true)
                return dir
        }

    /**
     * Parse file content into a variables object.
     * @param {String} file - File path
     * @param {Boolean} [list=false] - If enabled, return an array containing list of parameters
     * @return {Object} Variables
     */
        parse(file, list = false) { try {
                let content = this.image.entry(this.path(file, Entry.FILE)).content, vars = list ? [] : {}
                ;(content.match(/.+$/gm)||[]).map(l => l.trim()).filter(l => (l.charAt(0) !== "#")).map(v => {
                    let splitted = v.match(/(.*?)=(.*)/)
                    if (splitted === null) { return }
                    if (list) { vars.push(splitted[1]) } else { vars[splitted[1]] = splitted[2] }
                })
                return vars
            } catch (e) { return list ? [] : {} }
        }

    /**
     * Update a parsable file content.
     * @param {String} file - File path
     * @param {Object} data - New variables values (will be created if non existant)
     */
        update_parsable(file, data) {
            file = this.image.entry(this.path(file, Entry.FILE))
            for (let i in data) {
                let reg = new RegExp("^"+i+"=.*?\n", "im")
                if (reg.test(file.content)) { file.content = file.content.replace(reg, data[i] === null ? "" : `${i}=${data[i]}\n`) }
                else { file.content += `${i}=${data[i]}\n` }
            }
        }

    /**
     * Path working directory as stored in env.conf.
     * @type {String}
     */
        get pwd() { return this.env.PWD||"/" }

    /**
     * List of environment variables.
     * @type {Object}
     */
        get env() { return this.parse(Interface.ENV) }

    /**
     * List of registered users along with their password.
     * @type {Object}
     */
        get users() { return this.parse(Interface.USERS) }

    /**
     * List of registered users.
     * @type {String[]}
     */
        get users_list() { return this.parse(Interface.USERS, true) }

    /**
     * Logged user id.
     * @type {Number}
     */
        get user() { return this.users_list.indexOf(this.env.USER) }


    /**
     * Create base folders and configurations files.
     */
        init() {
            //System folder
                let sys = this.create({
                    name:"system",
                    type:Entry.FOLDER,
                    owner:0,
                    parent:Entry.ROOT
                })

            //Env.conf
                this.create({
                    name:"env.conf",
                    type:Entry.FILE,
                    owner:0,
                    parent:sys,
                    content:"# Path working directory\nPWD=/home\n# Logged user\nUSER=guest\n# Home directory\nHOME=/home",
                })
            //Users.conf
                this.create({
                    name:"users.conf",
                    type:Entry.FILE,
                    owner:0,
                    parent:sys,
                    content:"root=alpine\nguest=\n",
                })
            //Home directory
                let home = this.create({
                    name:"home",
                    type:Entry.FOLDER,
                    owner:0,
                    parent:Entry.ROOT
                })
        }

    /**
     * <pre>
     * Eval a string.
     * </pre>
     * <div class="alert info">
     * Although <span class="bold">window</span> (global scope) is shadowed for first level code, it's actually still accessible by closures.
     * </div>
     * @param {String} str - String to be evalued
     * @param {undefined} [window] - Shadow window
     */
        static eval(str, window) {
            return eval(str)
        }

    /**
     * Format number of bytes.
     * @param {Number} n - Number of bytes
     * @return {String} Formatted output
     */
        static bytes_format(n) {
            let m = n.toExponential(2).match(/([.0-9]+)e(.+)$/)
            return `${(parseFloat(m[1])*100).toString().substr(0, 3)} ${["", "k", "M", "G", "T"][Math.floor((parseInt(m[2])-2)/3)]||""}B`
        }

    /**
     * Check privileges and throws an error if they're aren't enough.
     * @param {Entry|Number} entry - Entry to check
     * @param {String} [p="r"] - Right to check (r, w, x or d)
     * @return {Interface} Self
     * @throws {Error} Not enough privileges to perform action
     */
        privileges(entry, p = "r") {
            if (typeof entry === "number") {
                if (entry === 0) { return this } else { entry = this.image.entry(entry) }
            }
            if ((this.admin_mode)||(!(entry instanceof Entry))) { return this }
            if (this.image.table_extended) {
                if (!entry.permissions[entry.owner === this.user ? "u" : "o"][p]) { throw new Error("Not enough privileges to perform action") }
            }
            return this
        }
}

/**
 * Env file default path.
 * @memberof Interface
 * @static
 * @const
 * @type {String}
 * @default "system/env.conf"
 */
    Interface.ENV = "system/env.conf"

/**
 * Users file default path.
 * @memberof Interface
 * @static
 * @const
 * @type {String}
 * @default "system/users.conf"
 */
    Interface.USERS = "system/users.conf"

/**
 * Home folder default path.
 * @memberof Interface
 * @static
 * @const
 * @type {String}
 * @default "home"
 */
    Interface.HOME = "home"

/**
 * Reference to last instance of Interface created.
 * @memberof Interface
 * @static
 * @type {Interface}
 */
    Interface.LAST_INSTANCE = null
