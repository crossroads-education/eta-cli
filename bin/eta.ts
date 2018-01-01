#!/usr/bin/env node

import main from "../cli";

main(process.argv.slice(2)).then((result) => { process.exit(result ? 0 : 1); })
.catch(err => {
    console.error(err);
});
