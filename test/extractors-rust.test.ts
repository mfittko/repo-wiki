import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractImports, extractSymbols, extractExportedSymbols } from '../src/extractors.js';
import { scanRepository } from '../src/scanner.js';

const rustSource = `
use std::collections::{HashMap, HashSet};
use crate::models::{self, User as DomainUser};
use super::helpers::*;
pub use serde::{Deserialize, Serialize};

pub mod api;
mod internal;

pub struct Service;
struct Local;

pub enum Status { Ready, Busy }
enum LocalState { Init }

pub trait Handler {
    fn handle(&self);
}
trait PrivateTrait {}

pub const MAX_RETRIES: usize = 3;
const CACHE_KEY: &str = "cache:key";

pub static APP_NAME: &str = "repo-wiki";
static mut COUNTER: usize = 0;

pub async fn run() {}
fn helper() {}

impl Service {
    pub fn new() -> Self { Service }
}

impl Handler for Service {
    fn handle(&self) {}
}

impl<T> From<T> for Service where T: Into<String> {
    fn from(_value: T) -> Self { Service }
}
`;

test('extractImports returns deterministic Rust use metadata', () => {
  assert.deepEqual(extractImports(rustSource, 'Rust'), [
    'crate::models',
    'crate::models::User',
    'serde::Deserialize',
    'serde::Serialize',
    'std::collections::HashMap',
    'std::collections::HashSet',
    'super::helpers::*'
  ]);
});

test('extractImports handles Rust `as _` aliases without corrupting import paths', () => {
  const source = `
use foo::Bar as _;
use foo::{Baz as _, Qux as LocalQux};
`;

  assert.deepEqual(extractImports(source, 'Rust'), [
    'foo::Bar',
    'foo::Baz',
    'foo::Qux'
  ]);
});

test('extractSymbols and extractExportedSymbols extract Rust items and impl blocks', () => {
  const symbols = extractSymbols(rustSource, 'Rust');
  assert.ok(symbols.includes('Deserialize'));
  assert.ok(symbols.includes('Serialize'));
  assert.ok(symbols.includes('Service'));
  assert.ok(symbols.includes('Status'));
  assert.ok(symbols.includes('Handler'));
  assert.ok(symbols.includes('api'));
  assert.ok(symbols.includes('MAX_RETRIES'));
  assert.ok(symbols.includes('APP_NAME'));
  assert.ok(symbols.includes('COUNTER'));
  assert.ok(symbols.includes('run'));
  assert.ok(symbols.includes('helper'));
  assert.ok(symbols.includes('impl Service'));
  assert.ok(symbols.includes('impl Handler for Service'));
  assert.ok(symbols.includes('impl From<T> for Service'));

  const exported = extractExportedSymbols(rustSource, 'Rust');
  assert.deepEqual(exported, [
    { name: 'api', kind: 'mod' },
    { name: 'APP_NAME', kind: 'static' },
    { name: 'Deserialize', kind: 're-export' },
    { name: 'Handler', kind: 'trait' },
    { name: 'MAX_RETRIES', kind: 'const' },
    { name: 'run', kind: 'fn' },
    { name: 'Serialize', kind: 're-export' },
    { name: 'Service', kind: 'struct' },
    { name: 'Status', kind: 'enum' }
  ]);
});

test('Rust extraction is parse-error tolerant', () => {
  const malformed = `
pub fn still_works() {}
impl Broken {
pub struct Recovered;
use crate::broken::{self, Item;
`;

  assert.doesNotThrow(() => extractImports(malformed, 'Rust'));
  assert.doesNotThrow(() => extractSymbols(malformed, 'Rust'));
  assert.doesNotThrow(() => extractExportedSymbols(malformed, 'Rust'));

  assert.ok(extractImports(malformed, 'Rust').includes('crate::broken'));
  assert.ok(extractSymbols(malformed, 'Rust').includes('still_works'));
  assert.ok(extractSymbols(malformed, 'Rust').includes('Recovered'));
});

test('Rust extractor is top-level-only for inline module item declarations', () => {
  const source = `
pub mod api { pub struct Request; pub enum Response { Ok } }
`;

  const symbols = extractSymbols(source, 'Rust');
  const exported = extractExportedSymbols(source, 'Rust');

  assert.ok(symbols.includes('api'));
  assert.ok(!symbols.includes('Request'));
  assert.ok(!symbols.includes('Response'));
  assert.ok(exported.some((entry) => entry.name === 'api' && entry.kind === 'mod'));
  assert.ok(!exported.some((entry) => entry.name === 'Request'));
  assert.ok(!exported.some((entry) => entry.name === 'Response'));
});

test('scanRepository produces Rust source cards with import and item metadata', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-rust-test-'));

  try {
    await fs.mkdir(path.join(dir, 'src'), { recursive: true });
    await fs.writeFile(path.join(dir, 'src', 'lib.rs'), rustSource, 'utf8');

    const out = path.join(dir, '.llmwiki', 'run');
    const result = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: out });
    const card = result.manifest.files.find((file) => file.path === 'src/lib.rs');

    assert.ok(card, 'lib.rs card should exist');
    assert.equal(card.language, 'Rust');
    assert.deepEqual(card.imports, [
      'crate::models',
      'crate::models::User',
      'serde::Deserialize',
      'serde::Serialize',
      'std::collections::HashMap',
      'std::collections::HashSet',
      'super::helpers::*'
    ]);
    assert.ok(card.symbols.includes('Deserialize'));
    assert.ok(card.symbols.includes('Service'));
    assert.ok(card.symbols.includes('impl Service'));
    assert.ok(card.symbols.includes('impl Handler for Service'));
    assert.ok(card.exported_symbols.some((entry) => entry.name === 'Deserialize' && entry.kind === 're-export'));
    assert.ok(card.exported_symbols.some((entry) => entry.name === 'Service' && entry.kind === 'struct'));
    assert.ok(card.exported_symbols.some((entry) => entry.name === 'run' && entry.kind === 'fn'));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
