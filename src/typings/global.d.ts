// Import the specific types from naive-ui if available
// If not directly importable, you might need to define appropriate types based on the library's documentation
import { LoadingBarApi, DialogApi, MessageApi, NotificationApi } from 'naive-ui';

declare global {
  interface Window {
    $loadingBar: LoadingBarApi;
    $dialog: DialogApi;
    $message: MessageApi;
    $notification: NotificationApi;
  }
}
