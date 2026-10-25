import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";

export function useAvailabilityCheck({
    value,
    isValidFormat,
    request,
    delay = 700,
}) {
    const debounced = useDebounce(value, delay);
    const [result, setResult] = useState({ status: "idle", message: null });

    const settling = value !== debounced;

    useEffect(() => {
        if (!debounced || !isValidFormat(debounced)) {
            setResult({ status: "idle", message: null });
            return;
        }
        const controller = new AbortController();
        setResult({ status: "checking", message: null });

        request(debounced, { signal: controller.signal })
            .then((body) => {
                const data = body?.data ?? body ?? {};
                const taken =
                    data.available === false ||
                    data.exists === true ||
                    data.is_available === false;
                setResult({
                    status: taken ? "taken" : "available",
                    message: taken ? body?.message : null,
                });
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                const res = error?.response;
                if (res && (res.status === 422 || res.status === 409)) {
                    const errors = res.data?.errors ?? {};
                    const first = Object.values(errors)[0];
                    const message =
                        (Array.isArray(first) ? first[0] : first) ||
                        res.data?.message;
                    setResult({ status: "taken", message });
                } else {
                    setResult({ status: "idle", message: null });
                }
            });

        return () => controller.abort();
    }, [debounced, isValidFormat, request]);

    if (!value) return { status: "idle", message: null };
    return settling ? { status: "checking", message: null } : result;
}
