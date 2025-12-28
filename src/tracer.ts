export interface TracerLocation {
    start: {line: number; column: number; offset: number};
    end: {line: number; column: number; offset: number};
}

export interface TracerEvent {
    type: 'rule.enter' | 'rule.match' | 'rule.fail';
    rule: string;
    description?: string;
    location: TracerLocation;
    indentation?: number;
}

export interface SmartError extends Error {
    location?: TracerLocation;
}

function findLastIndex<T>(arr: T[], func: (item: T) => boolean): number {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
        const item = arr[i];
        if (item !== undefined && func(item)) {
            return i;
        }
    }
    return -1;
}

function takeWhile<T>(arr: T[], func: (item: T) => boolean): T[] {
    const len = arr.length;
    let i = 0;
    for (; i < len; i += 1) {
        const item = arr[i];
        if (item === undefined || !func(item)) {
            return arr.slice(0, i);
        }
    }
    return arr;
}

export class Tracer {
    private events: TracerEvent[] = [];
    private indentation: number = 0;
    private readonly whitespaceRule: RegExp = /(^whitespace)|(char$)|(^[oe]$)|(^sym_)/i;
    private readonly statementRule: RegExp = /Statement$/i;
    private readonly firstNodeRule: RegExp = /(Statement|Clause)$/i;

    public trace(event: TracerEvent): void {
        event.indentation = this.indentation;

        switch (event.type) {
            case 'rule.enter':
                // add entered leaf
                this.events.push(event);
                this.indentation += 1;
                break;
            case 'rule.match':
                this.indentation -= 1;
                break;
            case 'rule.fail': {
                // remove failed leaf
                const lastIndex = findLastIndex(this.events, ({rule}) => rule === event.rule);
                const lastWsIndex = findLastIndex(
                    this.events,
                    (e) => !this.whitespaceRule.test(e.rule),
                );

                if (this.whitespaceRule.test(event.rule) || lastIndex === lastWsIndex) {
                    this.events.splice(lastIndex, 1);
                }
                this.indentation -= 1;
                break;
            }
        }
    }

    /**
     * @note There is way too much magic/nonsense in this method now. Need to come up with an
     *   alternative approach to getting the right information for syntax errors.
     */
    public smartError<T extends SmartError>(err: T): T {
        let deep = false;
        let stmts = 0;
        let bestNode: TracerEvent | {indentation: number; description?: string} = {
            indentation: -1,
        };

        const namedEvents = this.events
            .filter((e) => e.description != null && !this.whitespaceRule.test(e.rule))
            .reverse();

        const chain = takeWhile(namedEvents, (elem) => {
            if (/^(sym_semi)$/i.test(elem.rule)) {
                stmts += 1;
            }
            if (stmts > 1) {
                return false;
            }
            if (!deep) {
                const elemIndentation = elem.indentation ?? -1;
                const bestIndentation = bestNode.indentation ?? -1;
                if (elemIndentation > bestIndentation) {
                    bestNode = elem;
                } else {
                    deep = true;
                }
            } else if (/^(stmt)$/i.test(elem.rule)) {
                deep = true;
                return true;
            }
            return true;
        });

        if (chain.length) {
            const location = (bestNode as TracerEvent).location;
            const firstNode = chain.find(
                (elem) =>
                    elem.description != null &&
                    this.firstNodeRule.test(elem.description) &&
                    elem.description !== bestNode.description &&
                    elem.indentation !== bestNode.indentation,
            );

            let chainDetail: string;
            const bestDescription = bestNode.description ?? '';

            if (firstNode == null) {
                chainDetail = bestDescription;
            } else if (
                this.statementRule.test(bestDescription) &&
                firstNode.description != null &&
                this.statementRule.test(firstNode.description)
            ) {
                chainDetail = firstNode.description;
            } else {
                chainDetail = bestDescription + ' (' + (firstNode.description ?? '') + ')';
            }

            const message = 'Syntax error found near ' + chainDetail;
            Object.assign(err, {
                message,
                location,
            });
        }

        return err;
    }
}
