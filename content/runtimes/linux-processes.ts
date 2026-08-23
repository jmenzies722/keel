import { unknownLinux } from "@/lib/simulator/terminal";
import type { TerminalRuntimeSpec } from "@/lib/simulator/types";

const PS = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.2 167832  9840 ?        Ss   09:01   0:02 /sbin/init
root       142  0.0  0.4  89220 18440 ?        Ss   09:01   0:01 /usr/lib/systemd/systemd-journald
root       318  0.0  0.1   8892  4212 ?        Ss   09:01   0:00 /usr/sbin/sshd
app        904  0.1  1.2 215332 48920 ?        Ss   09:12   0:04 /usr/bin/python3 /opt/lab/worker.py
app        941 98.7  2.8 411204 112440 ?       R    10:04  41:17 /usr/bin/python3 /tmp/burn.py
app        988  0.0  0.3  22012 12208 pts/0    Ss   10:11   0:00 -bash`;

export const linuxExploreRuntime: TerminalRuntimeSpec = {
  id: "linux-explore",
  hostname: "lab-01",
  promptUser: "learner",
  cwd: "~",
  motd: "Training host. Investigate the process table. Type `help` for available commands.",
  commands: [
    {
      match: "ps aux",
      run: () => ({
        stdout: PS,
        stderr: "",
        exitCode: 0,
        discoveries: ["process-table", "runaway-visible"],
      }),
    },
    {
      match: "ps",
      run: () => ({
        stdout: `    PID TTY          TIME CMD
    988 pts/0    00:00:00 bash
   1022 pts/0    00:00:00 ps`,
        stderr: "",
        exitCode: 0,
        discoveries: ["process-table"],
      }),
    },
    {
      match: "ps -ef",
      run: () => ({
        stdout: `UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 09:01 ?        00:00:02 /sbin/init
root       142     1  0 09:01 ?        00:00:01 /usr/lib/systemd/systemd-journald
app        904     1  0 09:12 ?        00:00:04 /usr/bin/python3 /opt/lab/worker.py
app        941     904 99 10:04 ?      00:41:17 /usr/bin/python3 /tmp/burn.py
app        988   318  0 10:11 pts/0    00:00:00 -bash`,
        stderr: "",
        exitCode: 0,
        discoveries: ["process-table", "parent-child"],
      }),
    },
    {
      match: "cat /proc/941/status",
      run: () => ({
        stdout: `Name:   python3
State:  R (running)
Pid:    941
PPid:   904
VmRSS:     112440 kB
Threads:    1
SigQ:   0/31491`,
        stderr: "",
        exitCode: 0,
        discoveries: ["runaway-pid", "proc-status"],
      }),
    },
    {
      match: "kill -15 941",
      run: () => ({
        stdout: "",
        stderr: "",
        exitCode: 0,
        discoveries: ["signal-sent"],
        effects: { runawayStopped: true },
      }),
    },
    {
      match: "kill 941",
      run: () => ({
        stdout: "",
        stderr: "",
        exitCode: 0,
        discoveries: ["signal-sent"],
        effects: { runawayStopped: true },
      }),
    },
    {
      match: "top",
      run: () => ({
        stdout: `top - 10:18:02 up  1:17,  1 user,  load average: 1.21, 1.08, 0.74
%Cpu(s): 98.4 us,  0.8 sy,  0.0 ni,  0.6 id
MiB Mem :   3924.2 total,    412.1 free,   2610.4 used

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    941 app       20   0  411204 112440   6112 R  98.7   2.8  41:17.02 python3
    904 app       20   0  215332  48920   5400 S   0.3   1.2   0:04.11 python3
      1 root      20   0  167832   9840   6680 S   0.0   0.2   0:02.04 systemd`,
        stderr: "",
        exitCode: 0,
        discoveries: ["runaway-visible"],
      }),
    },
  ],
  fallback: unknownLinux,
};

export const linuxLabRuntime: TerminalRuntimeSpec = {
  ...linuxExploreRuntime,
  id: "linux-lab",
  motd: "Lab host. A worker is misbehaving. Identify the process, confirm its parent, and stop it with SIGTERM — not SIGKILL first.",
};
