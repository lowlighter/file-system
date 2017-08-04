/**
 * Remove an rentry.
 * @param {Entry} entry - Entry to remove
 * @param {DOMElement} figure - Associated icon
 */
    gui_delete(entry, figure) { try {
        //Iterative removal of folders and subfolders
            this.cmd_remove(entry)
            figure.remove()
        } catch (e) { this.gui_error(e) }
    }

/**
 * Allow user to rename an entry.
 * @param {Entry} entry - Entry to rename
 * @param {DOMElement} figure - Icon associated to current entry
 * @param {DOMElement} context - Current context
 */
    gui_rename(entry, figure, context) { try {
            let name = figure.find("figcaption").text()
            if (entry.name === name) { return }
            entry.name = name
            figure.remove()
            this.gui_icon(entry, context)
        } catch (e) { this.gui_error(e) }
    }

/**
 * Create a new folder.
 * @param {String} path - Folder to remove
 * @param {DOMElement} context - Associated context (current window)
 */
    gui_mkdir(path, context) { try {
            let id = this.cmd_mkentry(`${path}/${$(".text-new-folder").text()}`, "", Entry.FOLDER)
            this.gui_icon(this.image.entry(id), context)
        } catch (e) { this.gui_error(e) }
    }

/**
 * Create a new file.
 * @param {String} path - Path to where create new file
 * @param {DOMElement} context - Current context
 */
    gui_mkfile(path, context) { try {
            //Prepare new file
                let name = $(".text-new-file").text(), parent = this.path(path), id = null
            //Check if files already exists
                try { this.path(`${path}/${name}`, Entry.FILE) } catch (e) { id = this.create({name, parent, type:Entry.FILE, owner:this.user}) }
                if (id !== null) { this.gui_icon(this.image.entry(id), context) ; return id }
                else { throw new Error(`Couldn't create file ${path}/${name}`) }
        } catch (e) { this.gui_error(e) }
    }

/**
 * Move entry to another folder.
 * @param {Entry} entry - Entry to move
 * @param {DOMElement} figure - Icon associated to current entry
 * @param {DOMElement} context - Current context (allows to know pwd and to refresh icon)
 */
    gui_move(entry, figure, context) {
        //Entry mover manager
            let content = this.gui_window($(".text-move-to").text()).addClass("app-input").find(".app-windows-content")
            content.append(`<table>
                <tr><td>${GUI.TEXT.MOVE_TO}</td><td class="app-move-to-path" contenteditable="true"></td></tr>
                <tr><td colspan="2" class="app-move-to-msg"></td></tr>
                <tr><td colspan="2"><button class="app-move-to-validate">${GUI.TEXT.VALIDATE}</button></td></tr>
            </table>`)
        //Add user inputs
            content.find(".app-move-to-validate").click(() => { try {
                    //Resolve path (check if path already exists)
                        let path = content.find(".app-move-to-path").text().trim(), pwd = context.find(".app-windows-title").text()+"/"
                        if (/^\.\//.test(path)) { path = path.replace(/^\.\//, pwd) } else { path = "/"+path }
                        try { this.path(path, entry.type, pwd) }
                    //Move entry into new path
                        catch (e) {
                            let name = path.match(/\/([a-zA-Z.0-9]+)$/)[1]
                            try {
                                let parent = this.path(path.replace(new RegExp(name+"$"), "") )
                                entry.name = name ; entry.parent = parent
                                content.parent().remove() ; figure.remove()
                                if (this.path(pwd) === parent) { this.gui_icon(entry, context) }
                            } catch (e) { }
                        }
                        content.find(".app-move-to-msg").text(GUI.TEXT.INVALID_PATH)
                } catch (e) { this.gui_error(e) }
            })
    }
