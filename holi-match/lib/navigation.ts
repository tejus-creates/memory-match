import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/** Forward navigation — new screen slides in from the right. */
export function navigateForward(
  router: AppRouterInstance,
  path: string
): void {
  document.documentElement.dataset.navDirection = "forward";
  router.push(path);
}

/** Back navigation — new screen slides in from the left. */
export function navigateBack(
  router: AppRouterInstance,
  path: string
): void {
  document.documentElement.dataset.navDirection = "back";
  router.push(path);
}
