/**
 * Perform unit test.
 * @memberof {Image}
 */
    Image.prototype.test = function (data) {
        //Disable auto-sync
            this.sync(false)

        //General
            console.assert(this.size === this.width * this.height * 3, "Size mismatch", ` : expected ${this._size} instead of ${this.size}`)
            console.assert(this.crypted == data.crypted, "Crypted bit mismatch", ` : expected ${this.crypted} instead of ${data.crypted}`)
            console.assert(this.entry_name === data.name, "Entry name length mismatch", ` : expected ${this.entry_name} instead of ${data.name}`)
            console.assert(this.table_size === data.table, "Table size mismatch", ` : expected ${this.table_size} instead of ${data.table}`)
            console.assert(this.table_extended == data.extended, "Extended table option mismatch", ` : expected ${this.table_extended} instead of ${data.extended}`)
            console.assert(this.block_size === data.block, "Block size mismatch", ` : expected ${this.block_size} instead of ${data.block}`)

        //Unuses tests
            console.assert(this.entry_unused.id === 1, "First unused entry mismatch", ` : expected ${1} instead of ${this.entry_unused.id}`)
            console.assert(this.block_unused.id === 1, "First unused block mismatch", ` : expected ${1} instead of ${this.block_unused.id}`)

        //Entries
            for (let i = 1; i <= this.table_size; i++) {
                let f = this.entry(i)
                //Reduced set tests
                    console.assert(f.blank, `Entry ${i} status mismatch`, ` : expected ${true} instead of ${f.blank}`)
                    console.assert(f.type === Entry.FOLDER, `Entry ${i} type mismatch`, ` : expected ${Entry.FOLDER} instead of ${f.type}`)
                    console.assert(f.folder, `Entry ${i} type mismatch`, ` : expected ${true} instead of ${f.folder}`)
                    console.assert(!f.file, `Entry ${i} type mismatch`, ` : expected ${true} instead of ${!f.file}`)
                    console.assert(f.visibility === Entry.HIDDEN, `Entry ${i} visibility mismatch`, ` : expected ${Entry.HIDDEN} instead of ${f.visibility}`)
                    console.assert(f.hidden, `Entry ${i} visibility mismatch`, ` : expected ${true} instead of ${f.hidden}`)
                    console.assert(!f.visible, `Entry ${i} visibility mismatch`, ` : expected ${true} instead of ${!f.visible}`)
                    console.assert(f.owner === 0, `Entry ${i} owner mismatch`, ` : expected ${0} instead of ${f.owner}`)
                    console.assert(f.parent.id === Entry.BLANK, `Entry ${i} parent mismatch`, ` : expected ${Entry.BLANK} instead of ${f.parent}`)
                    console.assert(f.block.id === 0, `Entry ${i} block mismatch`, ` : expected ${0} instead of ${f.block}`)
                //Extended set tests
                    if (this.table_extended) {
                        console.assert(f.creation.y === Entry.DATE_OFFSET, `Entry ${i} creation date mismatch`, ` : expected ${Entry.DATE_OFFSET} instead of ${f.creation.y}`)
                        console.assert(f.creation.m === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.m}`)
                        console.assert(f.creation.d === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.d}`)
                        console.assert(f.creation.h === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.h}`)
                        console.assert(f.creation.i === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.i}`)
                        console.assert(f.creation.s === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.s}`)
                        console.assert(f.edition.y === Entry.DATE_OFFSET, `Entry ${i} edition date mismatch`, ` : expected ${Entry.DATE_OFFSET} instead of ${f.edition.y}`)
                        console.assert(f.edition.m === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.m}`)
                        console.assert(f.edition.d === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.d}`)
                        console.assert(f.edition.h === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.h}`)
                        console.assert(f.edition.i === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.i}`)
                        console.assert(f.edition.s === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.s}`)
                        console.assert(f.permissions.u.r == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.r}`)
                        console.assert(f.permissions.u.w == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.w}`)
                        console.assert(f.permissions.u.x == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.x}`)
                        console.assert(f.permissions.u.d == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.d}`)
                        console.assert(f.permissions.o.r == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.r}`)
                        console.assert(f.permissions.o.w == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.w}`)
                        console.assert(f.permissions.o.x == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.x}`)
                        console.assert(f.permissions.o.d == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.d}`)
                    }
                //Name and content tests
                    console.assert(f.name.length === 0, `Entry ${i} name mismatch`, ` : expected ${0} instead of ${f.name.length}`)
                    console.assert(f.content === null, `Entry ${i} content mismatch`, ` : expected ${null} instead of ${f.content}`)
            }

        //Blocks
            for (let i = 1; i <= this.block_number; i++) {
                let b = this.block(i)
                console.assert(!b.used, `Block ${i} status mismatch`, ` : expected ${true} instead of ${!b.used}`)
                console.assert(b.next.id === 0, `Block ${i} next mismatch`, ` : expected ${0} instead of ${b.next.id}`)
                console.assert(b.end === 1, `Block ${i} end mismatch`, ` : expected ${1} instead of ${b.end}`)
                console.assert(b.content.length === this.block_size-3, `Block ${i} content mismatch`, ` : expected ${this.block_size-3} instead of ${b.content.length}`)
            }

        //Entry tests
            let lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".substr(-this.block_size*4)
            let f = this.entry_unused, b = this.block_unused
            f.type = Entry.FILE
            f.visibility = Entry.VISIBLE
            f.owner = 0b011111
            f.parent = Entry.ROOT
            f.name = "X".repeat(this.entry_name)
            f.content = lorem
            if (this.table_extended) {
                f.creation = {y:2255, m:12, d:31, h:23, i:59, s:59}
                f.edition = {y:2001, m:1, d:1, h:1, i:1, s:1}
                f.permissions = {u:{r:1, w:1, x:1, d:0}, o:{r:1, w:0, x:0, d:1}}
            }

        //Reduced set tests
            console.assert(!f.blank, `Entry test status mismatch`, ` : expected ${false} instead of ${!f.blank}`)
            console.assert(f.file, `Entry test type mismatch`, ` : expected ${true} instead of ${f.file}`)
            console.assert(f.visible, `Entry test visibility mismatch`, ` : expected ${true} instead of ${f.visible}`)
            console.assert(f.owner === 0b011111, `Entry test owner mismatch`, ` : expected ${0b011111} instead of ${f.owner}`)
            console.assert(f.parent.root, `Entry test parent mismatch`, ` : expected ${true} instead of ${f.parent.root}`)
            console.assert(f.block.id === b.id, `Entry test block mismatch`, ` : expected ${b.id} instead of ${f.block.id}`)

        //Name and content tests
            console.assert(f.name.length === this.entry_name, `Entry test name length mismatch`, ` : expected ${this.entry_name} instead of ${f.name.length}`)
            console.assert(f.content === lorem, `Entry test content mismatch`, ` : expected ${lorem} instead of ${f.content}`)
            console.assert(this.entry_unused.id !== f.id, `First unused entry mismatch`, ` : expected ${this.entry_unused.id} different of ${f.id}`)
            console.assert(this.block_unused.id !== b.id, `First unused block mismatch`, ` : expected ${this.block_unused.id} different of ${b.id}`)

        //Extended set tests
            if (this.table_extended) {
                console.assert(f.creation.y === 2255, `Entry test creation date mismatch`, ` : expected ${2255} instead of ${f.creation.y}`)
                console.assert(f.creation.m === 12, `Entry test creation date mismatch`, ` : expected ${12} instead of ${f.creation.m}`)
                console.assert(f.creation.d === 31, `Entry test creation date mismatch`, ` : expected ${31} instead of ${f.creation.d}`)
                console.assert(f.creation.h === 23, `Entry test creation date mismatch`, ` : expected ${23} instead of ${f.creation.h}`)
                console.assert(f.creation.i === 59, `Entry test creation date mismatch`, ` : expected ${59} instead of ${f.creation.i}`)
                console.assert(f.creation.s === 59, `Entry test creation date mismatch`, ` : expected ${59} instead of ${f.creation.s}`)
                console.assert(f.edition.y === 2001, `Entry test edition date mismatch`, ` : expected ${1001} instead of ${f.edition.y}`)
                console.assert(f.edition.m === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.m}`)
                console.assert(f.edition.d === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.d}`)
                console.assert(f.edition.h === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.h}`)
                console.assert(f.edition.i === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.i}`)
                console.assert(f.edition.s === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.s}`)
                console.assert(f.permissions.u.r == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.u.r}`)
                console.assert(f.permissions.u.w == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.u.w}`)
                console.assert(f.permissions.u.x == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.u.x}`)
                console.assert(f.permissions.u.d == 0, `Entry test permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.d}`)
                console.assert(f.permissions.o.r == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.o.r}`)
                console.assert(f.permissions.o.w == 0, `Entry test permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.w}`)
                console.assert(f.permissions.o.x == 0, `Entry test permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.x}`)
                console.assert(f.permissions.o.d == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.o.d}`)
            }

        //Second file test
            let g = this.entry_unused
            let fox = "The quick brown fox jumps over the lazy dog."
            g.data = {type:Entry.FILE, blank:false}
            g.content = fox
            console.assert(g.content === fox, `Entry test content mismatch`, ` : expected ${fox} instead of ${g.content}`)
            console.assert(f.content === lorem, `Entry test content mismatch`, ` : expected ${lorem} instead of ${f.content}`)


        //Deletition test
            f.blank = true
            console.assert(f.blank, `Entry test status mismatch`, ` : expected ${false} instead of ${f.blank}`)
            console.assert(this.entry_unused.id === f.id, `First unused entry mismatch`, ` : expected ${this.entry_unused.id} equal to ${f.id}`)
            console.assert(this.block_unused.id === b.id, `First unused block mismatch`, ` : expected ${this.block_unused.id} equal to ${b.id}`)

        //Enable auto-sync
            this.sync(true)
    }
