import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  extractImports,
  extractSymbols,
  extractExportedSymbols,
  extractGoPackage
} from '../src/extractors.js';
import { scanRepository } from '../src/scanner.js';

// ---------------------------------------------------------------------------
// Fixture: representative Go source file
// ---------------------------------------------------------------------------
const goSource = `// Package utils provides utility helpers.
package utils

import (
\t"fmt"
\t"os"
\t"strings"
\t_ "database/sql"
\talias "math/rand"
)

import "errors"

const MaxRetries = 3
const minTimeout = 100

const (
\tStatusOK      = 200
\tStatusNotFound = 404
\tstatusInternal = 500
)

var ErrNotFound = errors.New("not found")
var count = 0

var (
\tDefaultTimeout = 30
\tdefaultHost    = "localhost"
)

type Client struct {
\tAddr string
\tPort int
}

type handler interface {
\tHandle(r Request) Response
}

type Handler interface {
\tHandle(r Request) Response
\tClose() error
}

type StringMap = map[string]string

type intAlias int

func NewClient(addr string, port int) *Client {
\treturn &Client{Addr: addr, Port: port}
}

func (c *Client) Connect() error {
\treturn fmt.Errorf("connecting to %s:%d", c.Addr, c.Port)
}

func (c *Client) close() {
\tfmt.Println("closing")
}

func helper(s string) string {
\treturn strings.TrimSpace(s)
}

func init() {
\tos.Setenv("INIT", "1")
}
`;

// ---------------------------------------------------------------------------
// Package extraction
// ---------------------------------------------------------------------------
test('extractGoPackage returns package name for Go files', () => {
  assert.equal(extractGoPackage(goSource, 'Go'), 'utils');
});

test('extractGoPackage returns package name from package main', () => {
  assert.equal(extractGoPackage('package main\n\nfunc main() {}\n', 'Go'), 'main');
});

test('extractGoPackage returns null when no package declaration', () => {
  assert.equal(extractGoPackage('// no package here\n', 'Go'), null);
});

test('extractGoPackage returns null for non-Go languages', () => {
  assert.equal(extractGoPackage('package utils', 'TypeScript'), null);
  assert.equal(extractGoPackage('package utils', 'Python'), null);
});

test('extractGoPackage ignores package-like words in comments and strings', () => {
  const src = [
    '// This package is great.',
    '// package fake',
    'const doc = "package stringlit"',
    'const raw = `',
    'package rawlit',
    '`',
    'package real',
    ''
  ].join('\n');
  assert.equal(extractGoPackage(src, 'Go'), 'real');
});

// ---------------------------------------------------------------------------
// Import extraction
// ---------------------------------------------------------------------------
test('extractImports returns sorted Go imports from block and single forms', () => {
  const imports = extractImports(goSource, 'Go');
  assert.deepEqual(imports, [
    'database/sql',
    'errors',
    'fmt',
    'math/rand',
    'os',
    'strings'
  ]);
});

test('extractImports handles single import only', () => {
  assert.deepEqual(extractImports('package main\nimport "fmt"\n', 'Go'), ['fmt']);
});

test('extractImports handles aliased and blank imports', () => {
  const src = `package main\nimport (\n\t_ "log"\n\talias "net/http"\n)\n`;
  assert.deepEqual(extractImports(src, 'Go'), ['log', 'net/http']);
});

test('extractImports does not truncate Go import blocks on comment parentheses', () => {
  const src = `package main
import (
	"fmt" // note: this comment has ) in it
	"net/http"
)
`;
  assert.deepEqual(extractImports(src, 'Go'), ['fmt', 'net/http']);
});

test('extractImports returns empty for Go file with no imports', () => {
  assert.deepEqual(extractImports('package main\n\nfunc main() {}\n', 'Go'), []);
});

test('extractImports returns empty for non-Go language', () => {
  assert.deepEqual(extractImports('import "fmt"', 'Python'), []);
  assert.deepEqual(extractImports('import "fmt"', 'Rust'), []);
});

// ---------------------------------------------------------------------------
// Symbol extraction
// ---------------------------------------------------------------------------
test('extractSymbols returns all top-level Go symbols sorted', () => {
  const symbols = extractSymbols(goSource, 'Go');
  assert.ok(symbols.includes('NewClient'), 'should include exported function');
  assert.ok(symbols.includes('Client'), 'should include exported struct');
  assert.ok(symbols.includes('Handler'), 'should include exported interface');
  assert.ok(symbols.includes('MaxRetries'), 'should include exported const');
  assert.ok(symbols.includes('ErrNotFound'), 'should include exported var');
  assert.ok(symbols.includes('StringMap'), 'should include exported type alias');
  // unexported
  assert.ok(symbols.includes('helper'), 'should include unexported function');
  assert.ok(symbols.includes('init'), 'should include init function');
  assert.ok(symbols.includes('count'), 'should include unexported var');
  assert.ok(symbols.includes('minTimeout'), 'should include unexported const');
  assert.ok(symbols.includes('handler'), 'should include unexported interface');
  assert.ok(symbols.includes('intAlias'), 'should include unexported type');
});

test('extractSymbols returns symbols in sorted order', () => {
  const symbols = extractSymbols(goSource, 'Go');
  const sorted = [...symbols].sort();
  assert.deepEqual(symbols, sorted);
});

test('extractSymbols returns empty for non-Go language', () => {
  assert.deepEqual(extractSymbols('func Foo() {}', 'Python'), []);
  assert.deepEqual(extractSymbols('func Foo() {}', 'Rust'), []);
});

test('extractSymbols returns empty for empty Go file', () => {
  assert.deepEqual(extractSymbols('package main\n', 'Go'), []);
});

// ---------------------------------------------------------------------------
// Exported symbol extraction
// ---------------------------------------------------------------------------
test('extractExportedSymbols returns only exported Go symbols with correct kinds', () => {
  const exported = extractExportedSymbols(goSource, 'Go');

  // exported function
  assert.ok(exported.some((e) => e.name === 'NewClient' && e.kind === 'func'), 'NewClient func');
  // exported method
  assert.ok(exported.some((e) => e.name === 'Connect' && e.kind === 'func'), 'Connect method');
  // exported struct
  assert.ok(exported.some((e) => e.name === 'Client' && e.kind === 'struct'), 'Client struct');
  // exported interface
  assert.ok(exported.some((e) => e.name === 'Handler' && e.kind === 'interface'), 'Handler interface');
  // exported const (single)
  assert.ok(exported.some((e) => e.name === 'MaxRetries' && e.kind === 'const'), 'MaxRetries const');
  // exported const (block)
  assert.ok(exported.some((e) => e.name === 'StatusOK' && e.kind === 'const'), 'StatusOK const');
  assert.ok(exported.some((e) => e.name === 'StatusNotFound' && e.kind === 'const'), 'StatusNotFound const');
  // exported var (single)
  assert.ok(exported.some((e) => e.name === 'ErrNotFound' && e.kind === 'var'), 'ErrNotFound var');
  // exported var (block)
  assert.ok(exported.some((e) => e.name === 'DefaultTimeout' && e.kind === 'var'), 'DefaultTimeout var');
  // exported type alias
  assert.ok(exported.some((e) => e.name === 'StringMap' && e.kind === 'type'), 'StringMap type');
});

test('extractExportedSymbols excludes unexported symbols', () => {
  const exported = extractExportedSymbols(goSource, 'Go');
  const names = exported.map((e) => e.name);
  assert.ok(!names.includes('helper'), 'unexported func not included');
  assert.ok(!names.includes('init'), 'init not included');
  assert.ok(!names.includes('count'), 'unexported var not included');
  assert.ok(!names.includes('minTimeout'), 'unexported const not included');
  assert.ok(!names.includes('handler'), 'unexported interface not included');
  assert.ok(!names.includes('intAlias'), 'unexported type not included');
  assert.ok(!names.includes('defaultHost'), 'unexported var block not included');
  assert.ok(!names.includes('statusInternal'), 'unexported const block not included');
  assert.ok(!names.includes('close'), 'unexported method not included');
});

test('extractExportedSymbols returns sorted results', () => {
  const exported = extractExportedSymbols(goSource, 'Go');
  const sorted = [...exported].sort((a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind));
  assert.deepEqual(exported, sorted);
});

test('extractExportedSymbols returns empty for non-Go language', () => {
  assert.deepEqual(extractExportedSymbols('func Foo() {}', 'Python'), []);
});

// ---------------------------------------------------------------------------
// Method detection
// ---------------------------------------------------------------------------
test('extractSymbols captures methods on receiver types', () => {
  const src = `package api

type Server struct{ addr string }

func NewServer(addr string) *Server { return &Server{addr: addr} }
func (s *Server) Start() error { return nil }
func (s *Server) stop() {}
func (s Server) Addr() string { return s.addr }
`;
  const symbols = extractSymbols(src, 'Go');
  assert.ok(symbols.includes('NewServer'));
  assert.ok(symbols.includes('Start'));
  assert.ok(symbols.includes('stop'));
  assert.ok(symbols.includes('Addr'));
  assert.ok(symbols.includes('Server'));

  const exported = extractExportedSymbols(src, 'Go');
  assert.ok(exported.some((e) => e.name === 'Start' && e.kind === 'func'));
  assert.ok(exported.some((e) => e.name === 'Addr' && e.kind === 'func'));
  assert.ok(exported.some((e) => e.name === 'NewServer' && e.kind === 'func'));
  assert.ok(!exported.map((e) => e.name).includes('stop'));
});

// ---------------------------------------------------------------------------
// Generic functions and types
// ---------------------------------------------------------------------------
test('extractSymbols captures generic function and type names', () => {
  const src = `package generic

func Map[T, U any](xs []T, f func(T) U) []U { return nil }

type Set[T comparable] struct{ m map[T]struct{} }
`;
  const symbols = extractSymbols(src, 'Go');
  assert.ok(symbols.includes('Map'));
  assert.ok(symbols.includes('Set'));
});

// ---------------------------------------------------------------------------
// Comma-separated const/var declarations
// ---------------------------------------------------------------------------
test('extractSymbols captures all identifiers in comma-separated const and var declarations', () => {
  const src = `package p
var Alpha, Beta int
const Gamma, Delta = 1, 2
var (
\tOne, Two int
)
const (
\tThree, Four = 3, 4
)
`;
  const symbols = extractSymbols(src, 'Go');
  // single-line var
  assert.ok(symbols.includes('Alpha'), 'Alpha from single var');
  assert.ok(symbols.includes('Beta'), 'Beta from single var');
  // single-line const
  assert.ok(symbols.includes('Gamma'), 'Gamma from single const');
  assert.ok(symbols.includes('Delta'), 'Delta from single const');
  // var block multi-name
  assert.ok(symbols.includes('One'), 'One from var block');
  assert.ok(symbols.includes('Two'), 'Two from var block');
  // const block multi-name
  assert.ok(symbols.includes('Three'), 'Three from const block');
  assert.ok(symbols.includes('Four'), 'Four from const block');
});

test('extractExportedSymbols captures all identifiers in comma-separated const and var declarations', () => {
  const src = `package p
var Alpha, Beta int
const Gamma, Delta = 1, 2
var (
	One, Two int
)
const (
	Three, Four = 3, 4
)
`;
  const exported = extractExportedSymbols(src, 'Go');
  const names = exported.map((e) => e.name);
  assert.ok(names.includes('Alpha') && exported.find((e) => e.name === 'Alpha')?.kind === 'var');
  assert.ok(names.includes('Beta') && exported.find((e) => e.name === 'Beta')?.kind === 'var');
  assert.ok(names.includes('Gamma') && exported.find((e) => e.name === 'Gamma')?.kind === 'const');
  assert.ok(names.includes('Delta') && exported.find((e) => e.name === 'Delta')?.kind === 'const');
  assert.ok(names.includes('One') && exported.find((e) => e.name === 'One')?.kind === 'var');
  assert.ok(names.includes('Two') && exported.find((e) => e.name === 'Two')?.kind === 'var');
  assert.ok(names.includes('Three') && exported.find((e) => e.name === 'Three')?.kind === 'const');
  assert.ok(names.includes('Four') && exported.find((e) => e.name === 'Four')?.kind === 'const');
});

test('extractSymbols ignores commas in Go var and const right-hand side expressions', () => {
  const src = `package p
var Alpha = foo(Bar, Baz)
const Gamma = join(Delta, Epsilon)
var (
	One = makePair(Two, Three)
)
const (
	Four = choose(Five, Six)
)
`;
  const symbols = extractSymbols(src, 'Go');
  assert.deepEqual(symbols, ['Alpha', 'Four', 'Gamma', 'One']);
});


test('extractSymbols and extractExportedSymbols share cached Go declarations', () => {
  const src = `package cache\n\nfunc Foo() {}\nfunc bar() {}\n`;
  const symbols = extractSymbols(src, 'Go');
  const exported = extractExportedSymbols(src, 'Go');
  assert.ok(symbols.includes('Foo'));
  assert.ok(symbols.includes('bar'));
  assert.equal(exported.length, 1);
  assert.equal(exported[0].name, 'Foo');
  assert.equal(exported[0].kind, 'func');
});

// ---------------------------------------------------------------------------
// Scanner integration: Go file produces a source card with go_package
// ---------------------------------------------------------------------------
test('scanRepository produces a source card with go_package for .go files', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-go-test-'));

  try {
    await fs.mkdir(path.join(dir, 'pkg'), { recursive: true });
    await fs.writeFile(path.join(dir, 'pkg', 'math.go'), `package math

import "errors"

var ErrDivByZero = errors.New("division by zero")

func Add(a, b int) int { return a + b }

func Divide(a, b int) (int, error) {
\tif b == 0 {
\t\treturn 0, ErrDivByZero
\t}
\treturn a / b, nil
}
`);

    const out = path.join(dir, '.llmwiki', 'run');
    const result = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: out });

    const card = result.manifest.files.find((f) => f.path === 'pkg/math.go');
    assert.ok(card, 'math.go card should exist');
    assert.equal(card.language, 'Go');
    assert.equal((card as any).go_package, 'math');
    assert.deepEqual(card.imports, ['errors']);
    assert.ok(card.symbols.includes('Add'), 'symbols includes Add');
    assert.ok(card.symbols.includes('Divide'), 'symbols includes Divide');
    assert.ok(card.symbols.includes('ErrDivByZero'), 'symbols includes ErrDivByZero');
    assert.ok(card.exported_symbols.some((e: any) => e.name === 'Add' && e.kind === 'func'));
    assert.ok(card.exported_symbols.some((e: any) => e.name === 'ErrDivByZero' && e.kind === 'var'));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('extractGoPackage ignores package-like words in escaped string and rune literals', () => {
  // Exercises the escape-in-string branch of stripGoCommentsAndLiterals (double-quote strings)
  const src = [
    'const s = "pack\\\"age fake"',    // escaped quote inside string
    'const r = \'\\\'\'',             // rune literal with escaped quote
    'package real',
    ''
  ].join('\n');
  assert.equal(extractGoPackage(src, 'Go'), 'real');
});

test('extractGoPackage handles block comment with embedded string', () => {
  // Exercises block comment stripping with string-like content inside
  const src = [
    '/* "package inside block comment" */',
    'package real',
    ''
  ].join('\n');
  assert.equal(extractGoPackage(src, 'Go'), 'real');
});
