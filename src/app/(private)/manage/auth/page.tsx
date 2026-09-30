// Auth role of /manage: recovery emails + passcode (structure lands with M4/M5).
export default function ManageAuthPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-ink text-[26px] leading-[34px]">Auth</h1>
        <p className="text-muted-ink font-mono text-[14px]">Recovery emails and your passcode.</p>
      </div>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        <h2 className="text-ink text-[16px] font-medium">Recovery emails</h2>
        <p className="text-muted-ink mt-1 font-mono text-[13px]">
          Verified addresses you can receive a reset link at — max 5.
        </p>
        <div className="border-line-soft text-muted-ink mt-4 flex items-center justify-center rounded-[12px] border border-dashed py-8 font-mono text-[13px]">
          No addresses yet — add / remove lands in M5.
        </div>
      </section>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        <h2 className="text-ink text-[16px] font-medium">Passcode</h2>
        <p className="text-muted-ink mt-1 font-mono text-[13px]">
          Change the passcode that unlocks /manage.
        </p>
        <div className="border-line-soft text-muted-ink mt-4 flex items-center justify-center rounded-[12px] border border-dashed py-8 font-mono text-[13px]">
          Update form lands in M4.
        </div>
      </section>
    </div>
  );
}
