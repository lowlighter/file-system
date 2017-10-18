/**
 * Evaluate a command.
 * @param {String} line - User input
 * @param {DOMElement} ul - Unordered List
 * @private
 */
    _gui_cmd_eval(line, ul) {
        let args = line.split(" ").filter(a => a.length), li = $("<li></li>"), tmp, id, text, entry, type, ext, p, txt, name, parent, all, size, ctx
        try {
            switch (args[0]) {
                //System
                    case "pwd": li.text(this.pwd); break
                    case "env": li.text(this.image.entry(this.path(Interface.ENV, Entry.FILE)).content); break
                    case "whoami": li.text(`${this.env.USER} (user n° ${this.user})`); break
                //Application
                    case "explorer": this.gui_list(args[1]||this.pwd); break
                    case "terminal": $(".app-controller [data-app-icon=cmd]").click(); break
                    case "edit": this.gui_edit(args[1], this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                    case "play": this.gui_play(args[1], this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                    case "display": this.gui_display(args[1], this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                    case "exec": this.gui_execute(this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                //Simple entry update
                    case "cd": id = this.path(args[1]||this.env.HOME, Entry.FOLDER, this.pwd) ; this.update_parsable(Interface.ENV, {PWD:id < 1 ? "/" : this.image.entry(id).path}); break
                    case "mkdir": this.cmd_mkentry(args[1], this.pwd, Entry.FOLDER); break
                    case "mkfile": this.cmd_mkentry(args[1], this.pwd, Entry.FILE); break
                    case "rm": tmp = args.filter(a => a.charAt(0) !== "-"); this.cmd_remove(this.image.entry(this.path(tmp[1], args.indexOf("-r") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd)));  break
                    case "chown": tmp = args.filter(a => a.charAt(0) !== "-");
                        this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd)).owner = Math.max(0, this.users_list.indexOf(tmp[2])); break
                    case "stat": tmp = args.filter(a => a.charAt(0) !== "-"); entry = this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd))
                        this.gui_properties(entry); break
                //Advanced entry update
                    case "chmod": tmp = args.filter(a => (a.charAt(0) !== "-")&&(a.charAt(0) !== "+")); entry = this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd))
                        tmp = entry.permissions ;
                        if (args.indexOf("-r") > 0) { tmp.u.r = false } else if (args.indexOf("+r") > 0) { tmp.u.r = true }
                        if (args.indexOf("-w") > 0) { tmp.u.w = false } else if (args.indexOf("+w") > 0) { tmp.u.w = true }
                        if (args.indexOf("-x") > 0) { tmp.u.x = false } else if (args.indexOf("+x") > 0) { tmp.u.x = true }
                        if (args.indexOf("-d") > 0) { tmp.u.d = false } else if (args.indexOf("+d") > 0) { tmp.u.d = true }
                        if (args.indexOf("-R") > 0) { tmp.o.r = false } else if (args.indexOf("+R") > 0) { tmp.o.r = true }
                        if (args.indexOf("-W") > 0) { tmp.o.w = false } else if (args.indexOf("+W") > 0) { tmp.o.w = true }
                        if (args.indexOf("-X") > 0) { tmp.o.x = false } else if (args.indexOf("+X") > 0) { tmp.o.x = true }
                        if (args.indexOf("-D") > 0) { tmp.o.d = false } else if (args.indexOf("+D") > 0) { tmp.o.d = true }
                        entry.permissions = tmp
                        break;
                    case "mv": tmp = args.filter(a => a.charAt(0) !== "-"); entry = this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd))
                        try { this.path(path, entry.type, this.pwd) }
                        catch (e) {
                            name = (tmp[2].match(/\/([a-zA-Z.0-9]+)$/)||[, tmp[2]])[1]
                            parent = this.path(tmp[2].replace(new RegExp(name+"$"), ""), Entry.FOLDER, this.pwd); entry.name = name ; entry.parent = parent
                        }
                    break
                //LS
                    case "ls": tmp = args.filter(a => a.charAt(0) !== "-"); tmp = this.entries(this.path(tmp[1]||this.pwd, Entry.FOLDER, this.pwd))
                        type = (line.match(/-type=(FILE|FOLDER)/)||[, "ALL"])[1]
                        if (type !== "ALL") { if (type === "FILE") { tmp = tmp.filter(e => e.file) } if (type === "FOLDER") { tmp = tmp.filter(e => e.folder) } }
                        if (args.indexOf("-a") === -1) { tmp = tmp.filter(e => e.visible) }
                        if (args.indexOf("-l") > 0) { ext = this.image.table_extended ; text = tmp.map(e => { txt = (e.folder ? "f" : "-")
                            if (ext) {
                                p = e.permissions
                                txt += `${p.u.r ? "r" : "-"}${p.u.w ? "w" : "-"}${p.u.x ? "x" : "-"}${p.u.d ? "d" : "-"}`
                                txt += `${p.o.r ? "r" : "-"}${p.o.w ? "w" : "-"}${p.o.x ? "x" : "-"}${p.o.d ? "d" : "-"}`
                            }
                            txt += `\u00a0${((this.users_list[e.owner]||"")+"\u00a0".repeat("6")).substr(0, 6)}`
                            if (ext) { txt += `\u00a0${`${e.edition.d}/${e.edition.m}/${e.edition.y}`}` }
                            txt += `\u00a0${((e.name||"")+"\u00a0".repeat("18")).substr(0, 18)}`

                            return txt
                        }).join("\n") } else { text = tmp.map(e => e.name).join("\n") }
                        li.text(text)
                        break
                    case "tree": tmp = args.filter(a => a.charAt(0) !== "-"); tmp = this.entries(this.path(tmp[1]||this.pwd, Entry.FOLDER, this.pwd)); txt = ""
                        all = (args.indexOf("-a") > 0)
                        let recursion = (es, lv = 0) => {
                            es.map(e => {
                                if ((e.hidden)&&(!all)) { return }
                                txt += `${"\u00a0".repeat(2*lv)+"└─"}${e.name}\n`
                                if (e.folder) { recursion(this.entries(e.id), lv+1) }
                            })
                        }
                        recursion(tmp)
                        li.text(txt)
                        break
                //Encryption
                    case "encrypt": if (this.image.crypted) { throw new Error("Image already encrypted") } li.text(this._gui_encrypt(args[1], +1)); break
                    case "decrypt": if (!this.image.crypted) { throw new Error("Image already decrypted") } li.text(this._gui_encrypt(args[1], +1)); break
                //Sessions
                    case "adduser": args[2] = args[2]||"" ;
                        if (this.users_list.indexOf(args[1]) > 0) { throw new Error("User already exists") } tmp = {} ; tmp[args[1]] = args[2]||"" ;
                        this.update_parsable(Interface.USERS, tmp);
                        $("li:last-child div").text(args[2].length ? line.replace(new RegExp(args[2]+"\s*$"), "****") : `${line} ****`); break
                    case "deluser": args[2] = args[2]||"" ;
                        if (this.users[args[1]] !== args[2]) { throw new Error("Wrong username/password") } if (this.env.USER === args[1]) { throw new Error("Can't delete yourself") } tmp = {} ; tmp[args[1]] = null ;
                        this.update_parsable(Interface.USERS, tmp);
                        $("li:last-child div").text(args[2].length ? line.replace(new RegExp(args[2]+"\s*$"), "****") : `${line} ****`); break
                    case "su" : args[2] = args[2]||"" ;
                        if (this.users[args[1]] !== args[2]) { throw new Error("Wrong username/password") }
                        this.update_parsable(Interface.ENV, {USER:args[1]});
                        $("li:last-child div").text(args[2].length ? line.replace(new RegExp(args[2]+"\s*$"), "****") : `${line} ****`); break
                    case "users": li.text(this.users_list.join("\n")); break;
                //Disk format
                    case "dstat": $(".app-controller [data-app-icon=dstat]").click(); break
                    case "dload": $(".app-controller [data-app-icon=dload]").click(); break
                //Disk formatting
                    case "dformat":
                        //Size
                            size = line.match(/-size=(\d+)x(\d+)/)||[,400, 400]
                        //Clean context
                            ctx = this.image.context
                            ctx.canvas.width = parseInt(size[1]) ; ctx.canvas.height = parseInt(size[2])
                            ctx.fillStyle = 0 ; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                            this.context.empty()
                        //New GUI
                            if (new GUI( new Image(this.image.context, {
                                crypted:0,
                                table:parseInt((line.match(/-table-size=(\d+)/)||[,512])[1]),
                                block:parseInt((line.match(/-block-size=(\d+)/)||[,256])[1]),
                                name:parseInt((line.match(/-entry-name-length=(\d+)/)||[,32])[1]),
                                extended:(line.match(/-table-extended=(y|n)/)||[,"y"])[1] === "y" ? 1 : 0,
                            }), this.context)) { return }
                    case "help": li.text($(`[data-app-help=${args[1]||"help"}]`).text().trim()); break;
                default:
                    throw new Error(`Unknown command ${args[0]}`)
            }
        } catch (e) { li.text(`${e.name} : ${e.message}`).addClass("app-cmd-error") }

        if (li.text().length) { li.html(li.text().replace(/\n/g, "<br>")).appendTo(ul) }
        this._gui_cmd_new_line(ul)
    }

/**
 * Add gui terminal icon to desktop and add its trigger.
 */
    gui_cmd() {
        //Icon
            let icon = this._gui_icon("terminal", GUI.TEXT.TERMINAL).attr("data-app-icon", "cmd").appendTo(this.context)
        //Event
            icon.click(() => {
                let content = this.gui_window(GUI.TEXT.TERMINAL_FULL).addClass("app-windows-terminal").find(".app-windows-content")
                let ul = $(`<ul></ul>`).appendTo(content)
                this._gui_cmd_new_line(ul)
                content.click(() => ul.find("li:last-child div").focus())
            })
    }

/**
 * Create a new line into an instance of gui terminal.
 * @param {DOMElement} ul - Unordered List
 * @private
 */
    _gui_cmd_new_line(ul) {
        //Disable last line
            ul.find("li:last-child div").prop("contenteditable", false).off("keypress").off("keydown")
        //Create new line
            $(`<li>${this.env.USER||""} - ${this.pwd}: <div></div></li>`).appendTo(ul).find("div").prop("contenteditable", true).keypress((ev) => {
                //Enter : eval command
                    if (ev.which === 13) {
                        ev.preventDefault()
                        this._gui_cmd_eval($(ev.target).text().trim(), ul)
                        ul.parent().click()
                    }
            }).keydown(ev => {
                //Tab : complete command
                    if (ev.which === 9) {
                        ev.preventDefault()
                        this._gui_cmd_autocomplete($(ev.target).text().trim(), $(ev.target))
                    }
            }).focus()
    }

/**
 * <pre>
 * Autocompletition helper.
 * Parse user input and :
 * - If it's first argument, it will try to complete command name
 * - If it's second or more, it will either try to complete options name or path
 * Input is completed only if there is only one possibility.
 * </pre>
 * @param {String} line - User input
 * @param {DOMElement} li - User input field
 */
    _gui_cmd_autocomplete (line, li) {
        let auto = []
        let args = line.split(" ").filter(a => a.length)
        if (args.length === 1) { auto = GUI.COMMANDS } else if (args.length > 1) {
            switch (args[1]) {
                case "deluser", "su": auto = this.users_list ; break
                case "dformat": auto = ["-size=", "-table-size=", "-block-size=", "-entry-name-length=", "-table-extended="]; break
                case "help": auto = GUI.COMMANDS ; break
                case "pwd", "env", "whoami", "users", "dstat", "dload", "encrypt", "decrypt": break
                default:
                    let tmpath = args[args.length-1].replace(/\/\w+?$/, "/")
                    try { auto = this.entries(this.path(tmpath, Entry.FILE, this.pwd)).map(e => e.path) } catch (e) {
                        try { auto = this.entries(this.path(tmpath, Entry.FOLDER, this.pwd)).map(e => e.path) } catch (e) {
                            auto = []
                        }
                    }
            }
        }
        let regex = new RegExp("^"+args[args.length-1], "i")
        let filtered = auto.filter(a => regex.test(a))
        if (filtered.length === 1) {
            li.text(line.replace(new RegExp(args[args.length-1]+"\s*$"), filtered[0]))
            //Set caret at end
            let range, sel
            range = document.createRange(); range.selectNodeContents(li.get(0)); range.collapse(false)
            sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range)
        }
    }

/**
 * Create a new folder.
 * @param {String} path - Folder to remove
 * @param {String} [pwd=""] - Path working directory
 * @param {Number} [type="Entry.FOLDER"] - Entry type
 */
    cmd_mkentry(path, pwd = "", type=Entry.FOLDER) {
        let name = (path.match(/\/([a-zA-Z.0-9]+)$/)||[, path])[1]
        let parent = this.path(path.replace(new RegExp(name+"$"), ""), Entry.FOLDER, pwd)
        try { this.path(path, type, pwd) } catch (e) {
            return this.create({
                name, parent, type,
                owner:this.user
            })
        }
    }

/**
 * Remove an entry.
 * @param {Entry} entry - Entry to remove
 */
    cmd_remove(entry) {
        if (entry.folder) {
            let stack = [entry]
            while (stack.length) {
                let folder = stack.pop()
                let entries = this.entries(folder)
                entries.map(entry => (entry.folder ? stack.push(entry) : entry.blank = true))
                folder.blank = true
            }
        } else { entry.blank = true }
    }
