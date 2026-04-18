
import { hashSync, compareSync } from "bcrypt";
import { saltrounds } from "../../../conflig/conflig.service";

export function hash({
    plain_text,
    saltround = Number(saltrounds),
}: {
    plain_text: string;
    saltround?: number;
}): string {
    return hashSync(plain_text.toString(), Number(saltround));
}

export function compare({
    plain_text,
    cipher_text,
}: {
    plain_text: string;
    cipher_text: string;
}): boolean {
    return compareSync(plain_text, cipher_text);
}