import { ActionArgs, createPrAction, PrContext } from './utils/createAction';
import fs from 'fs';
import { getProcessEnvs } from './utils/envUtils';
import { log } from './utils/log';
import { runChromatic } from './chromatic';
import { createVercelDeploymentStg } from './vercel';

const botDelimiter = '## 🤖 Bot Message 🤖';

export const updateSummary = async ({ github, context, core }: ActionArgs, prNumber: number, replaceBody: (body: string) => string) => {
    const { data } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber,
    });
    core.info(`Source: ${data.body}`);
    const body = replaceBody(data.body ?? '');
    core.info(`Target: ${body}`);
    await github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber,
        body,
    });
    return body;
};

export const initSummary = async ({ github, context }: ActionArgs, prNumber: number, branchRef: string, originalBody?: string) => {
    let prTemplate = fs.readFileSync('.github/pull_request_template.md', 'utf8');
    if (!originalBody) {
        const { data } = await github.rest.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
        });
        originalBody = data.body ?? '';
    }

    let originalSummary = (originalBody || '').split(botDelimiter)[0]; 

    const body = `${originalSummary}${botDelimiter}${prTemplate.split(botDelimiter)[1]}`;

    await github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber,
        body,
    });
};

type PRChangeEvent = {
    changes: { body: { from: string } };
    pull_request: { number: number; body: string; head: { ref: string } };
    number: number;
    action: "edited" | "opened" | "synchronize";
};

export const hasCheckboxChanged = async (
    args: ActionArgs<PrContext>,
    event: PRChangeEvent,
    checkBoxText: string,
    replaceBody: (body: string) => string
) => {
    const prevState = `- [ ] ${checkBoxText}`;
    const nextState = `- [x] ${checkBoxText}`;
    const hasCheckboxUpdated =
        (event.changes.body.from.includes(prevState) && event.pull_request.body.includes(nextState));
    log(hasCheckboxUpdated ? 'cyan' : 'reset', `hasCheckboxUpdated ${checkBoxText} changed: ${hasCheckboxUpdated}`);
    if (hasCheckboxUpdated) {
        const body = await updateSummary(args, event.number, replaceBody);
        log('blue', `Updated ${checkBoxText} ${body}`);
        return checkBoxText;
    } else {
        return null;
    }
};

export const checkSummary = createPrAction(async (args) => {
    const { prEvent } = getProcessEnvs(args.process, ['prEvent'] as const); 

    const event: PRChangeEvent = JSON.parse(prEvent);

    // in case renovate removes the bot summary, regenerate it
    if (event.action !== "edited" || !event.pull_request.body.includes(botDelimiter)) {
        await initSummary(args, event.pull_request.number, event.pull_request.head.ref, event.pull_request.body);
        return { value: false, body: '' };
    }

    const values = await Promise.all((['Chromatic', 'Rebase', 'Vercel Klimt', 'Vercel Attico del Lino'] as const).map(async (checkBoxText) => {
        return await hasCheckboxChanged(args, event, checkBoxText, (body: string) => {
            let newBody = body.replace(' Failed ❌', '');
            if (/Vercel/.test(checkBoxText)) {
                newBody = newBody.replace(`- [x] ${checkBoxText}`, `- ${checkBoxText} deployment triggered ☑️`);
            } else {
                newBody = newBody.replace(`- [x] ${checkBoxText}`, `- ${checkBoxText} Running ⏳`);
            }

            return newBody;
        });
    }));
    const changedValue = values.find((value) => !!value);
    if (changedValue) {
        log('green', `ChangedValue: ${JSON.stringify(changedValue)}`);
        if (changedValue === "Chromatic") {
            await runChromatic(args);
        }
        if (/Vercel/.test(changedValue ?? '')) {
            await createVercelDeploymentStg(args);
        }
    } else {
        log('green', 'No checkbox changed');
    }
});


