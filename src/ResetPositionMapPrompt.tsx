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

export interface ResetPositionMapPromptProps extends Omit<DialogProps, 'children'> {
    resolve(result: boolean): void;
}

export const ResetPositionMapPrompt: React.FC<ResetPositionMapPromptProps> = ({ resolve, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Reset position map</DialogTitle>
                    <DialogContent>Clear all key assignments?</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                Reset
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
