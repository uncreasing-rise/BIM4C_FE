import { toast as sonner, type ExternalToast } from "sonner";

// The site Toaster sits top-right, over the viewer header's upload, session
// and inspector buttons. Viewer notices go bottom-right, above the status bar.
const at = (options?: ExternalToast): ExternalToast => ({
  position: "bottom-right",
  ...options,
});

type Message = Parameters<typeof sonner.success>[0];

export const toast = {
  success: (message: Message, options?: ExternalToast) => sonner.success(message, at(options)),
  error: (message: Message, options?: ExternalToast) => sonner.error(message, at(options)),
  info: (message: Message, options?: ExternalToast) => sonner.info(message, at(options)),
  loading: (message: Message, options?: ExternalToast) => sonner.loading(message, at(options)),
  dismiss: sonner.dismiss,
};
