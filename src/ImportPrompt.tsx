import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    useId,
} from '@fluentui/react-components';
import { useAsyncModalResolveCallback } from './useAsyncModal';

export interface ImportPromptProps extends Omit<DialogProps, 'children'> {
    resolve(result: boolean): void;
}

export const ImportPrompt: React.FC<ImportPromptProps> = ({ resolve, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Import devicetree</DialogTitle>
                    <DialogContent>
                        This will overwrite any changes you have made to the position map. Continue?
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                Import
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>Cancel</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
