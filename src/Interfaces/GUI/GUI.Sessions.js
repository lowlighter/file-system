/**
 * Create sessions manager interface.
 */
    gui_sessions() {
        //Sessions icon
            let sessions = this._gui_icon("sessions", GUI.TEXT.SESSIONS).appendTo(this.context)
        //Sessions opening
            sessions.click(() => {
                //Create session windows
                    if ($(".app-sessions").length) { return }
                    try {
                        let content = this.gui_window(GUI.TEXT.SESSIONS).addClass("app-sessions").find(".app-windows-content")
                        content.append(`<table>
                            <tr><td colspan="2">${GUI.TEXT.LOGGED_AS.replace("%s", this.env.USER)}</td></tr>
                            <tr><td>${GUI.TEXT.SESSIONS_USER}</td><td class="app-sessions-user" contenteditable="true"></td></tr>
                            <tr><td class="app-sessions-">${GUI.TEXT.SESSIONS_PASSWORD}</td><td class="app-sessions-password" contenteditable="true"></td></tr>
                            <tr><td colspan="2" class="app-sessions-msg"></td></tr>
                            <tr><td colspan="2">
                                <button class="app-sessions-remove">${GUI.TEXT.SESSIONS_REMOVE}</button>
                                <button class="app-sessions-create">${GUI.TEXT.SESSIONS_CREATE}</button>
                                <button class="app-sessions-login">${GUI.TEXT.SESSIONS_LOGIN}</button>
                            </td></tr></table>`)
                //User input events
                    $(".app-sessions-remove, .app-sessions-login, .app-sessions-create").hide()
                    content.find(".app-sessions-user, .app-sessions-password").keyup((ev) => this._gui_sessions((user) => {
                        //Check user
                            this.image.sync(false)
                            if (this.users_list.indexOf(user) >= 0) {
                                $(".app-sessions-remove, .app-sessions-login").addClass("disabled").show()
                                if (this.users[user] === $(".app-sessions-password").text()) { $(".app-sessions-remove, .app-sessions-login").removeClass("disabled") }
                            } else { $(".app-sessions-create").show() }
                            this.image.sync(true)
                    }))

                //User removal
                    content.find(".app-sessions-remove").click(() => this._gui_sessions((user) => {
                        //Remove user from text file
                            let users = this.image.entry(this.path(Interface.USERS, Entry.FILE))
                            users.content = users.content.replace(new RegExp(`${user}=.*?\n`, "i"), "")
                    }, "remove"))
                //User creation
                    content.find(".app-sessions-create").click(() => this._gui_sessions((user) => {
                            //Create user
                                this.image.entry(this.path(Interface.USERS, Entry.FILE)).content += `${user}=${$(".app-sessions-password").text()}\n`
                    }, "create"))
                //User login
                    content.find(".app-sessions-login").click(() => this._gui_sessions((user) => {
                        //Update env files
                            if ((this.users_list.indexOf(user) >= 0)&&(this.users[user] === $(".app-sessions-password").text())) {
                                    let env = this.image.entry(this.path(Interface.ENV, Entry.FILE))
                                    env.content = env.content.replace(/USER=.*?\n/i, `USER=${user}\n`)
                            }
                    }, "login"))
                } catch (e) { this.gui_error(e) }
            })
    }

/**
 * Execute session manager command sequence.
 * @ignore
 * @param {Function} callback - Body method
 * @param {String} [action] - Action name
 * @private
 */
    _gui_sessions(callback, action) { try {
        //Check user infos
            let user = $(".app-sessions-user").text().trim()
            if (user.length == 0) { return }
        //Refresh interface
            $(".app-sessions-remove, .app-sessions-login, .app-sessions-create").hide()
            callback(user)
        //Show result
            if (action) {
                $(".app-sessions-msg").text(GUI.TEXT[`SESSIONS_${action}_DONE`].replace("%s", user))
                $(".app-sessions-user, .app-sessions-password").empty()
            } else { $(".app-sessions-msg").empty() }
       } catch (e) { this.gui_error(e) }
    }

/**
 * Tell if logged user is admin.
 * @type {Boolean} 
 */
    get admin_mode() {
        return this.user === 0
    }
