+++
template = "page.html"
title = "Why I stopped C++"
date =  2018-10-18
draft = true
tags = ["bioinformatics", "language"]
+++

I have the feeling generaly bioinformatician uses two languages, a language for small scripts, rapid analysis, prototyping (usually an interpreted language) and another when we have performance needs (usually a compiled language).

Until what time these two languages for me was python and C++. If you follow me on twitter you probably saw my last two tools [yacrd](https://github.com/natir/yacrd) and [fpa](https://github.com/natir/fpa), these two tools were written in Rust.

# C++

C++ have very good performance in term of memory usage and computation time, compare to other language for same tasks, but C++ have two huge problems.

First it's easy to create memory leak in C++. You have a huge control to how memory are manage but if you are not very careful about how to allocate and free your memory, you probably create a memory leak and you may also waste a lot of time solving them. Use of intelligent pointers helps a lot but since their use is mandatory it is always very easy to create a memory leak.

The second is dependency management, it's easy, there are none. When you want to integrate a dependency you assume that it is sufficiently used to be present in most of the systems. Or you integrate it directly into your code, which poses several problems, you have to update your dependency yourself, it makes the compilation of your tools longer and more complex, it also manages the dependencies of your dependencies, and it makes your tools potentially more difficult to package properly.

[biicode](https://biicode.github.io/biicode/) try to solve this issue, but project seems dead, if you know other tools I am interested.

# Rust

Recently I wrote a little programme to remove chimera in long read dataset [yacrd](https://github.com/natir/yacrd) the first prototype is writen in Python it's worked well but the runtime isn't very cool. I rewrote yacrd in C++, durring developement I use smart pointer and valgrind, so I hope I didn't create a memory leak but I'm not sure. But after a while I thought it would be nice to be able to take compressed files in. After any search I can interface the C code of the compression libraries with my C++ code, or use the kseq.h but only support gzip compression.

I had discovered Rust 3 years earlier and it was a long time since I wanted to try this language so why not see if it can solve my problems. 

## Dependancy management

The dependancy management in Rust is just too easy, Cargo is the compilation, test, benchmark, dependency, packaging, *what you want* manager of Rust.

When creating a Rust project, the recommended way is use the command `Cargo init {project_name}` which will automatically create a folder with `{project_name}` which looks like this:

```
{project_name}
├── Cargo.toml
└── src
    └── main.rs
```

Cargo.toml is file containt many information about your project and a very important section `[dependencies]` you want add a dependencies in your project go to [crates.io](https://crates.io), *crates is name of package/module in Rust*, found crates they make want you want add it in your section dependencies of your Cargo.toml and that it, cargo download and build your dependency (and dependency of your dependency) for you, your contibutor and user. An easiest dependency systeme than python in compiled language, what you want more !!!

## No more memory leak

A main principe of Rust is if your code compile it will not contains any memory leak [^1]. How it's possible without Garbage Colector. Rust introduce a new concept *ownership*, I can try to explain how it's work but I probably make many mistake and forget something so go read this [chapter of rust book](https://doc.rust-lang.org/book/second-edition/ch04-00-understanding-ownership.html) it's probably clearer than an explanation I could give.

Just remember that it is very, very hard  to unintentionally create a memory leak, near to impossible for me, but that the mechanisms that Rust has put in place to be able to do this do not have impact to computation time and memory.

## Same perf

We talk about performance [the Computer Benchmark Language](https://benchmarksgame-team.pages.debian.net/benchmarksgame/) is a cool project they try to compare performance of many language, I provide a little overview of her result:

{{ plotly(id="cputime", src="cputime.js") }}

{{ plotly(id="memory", src="memory.js") }}

Rust is equivalent or better (with the eyes of hope) than c++ in cpu time and memory usage.


## Rust trouble

Ok Rust solve the two major problem of C++ with same advantage. But everything is not perfect Rust introduces a lot of new concept quite close to another language concept but still different so it can be difficult to understand why the code doesn't do what you want or why the compiler refused to compile.

Another little downside Rust is a young language (less than 10 years old) some classic thing does not exist or not yet. An example for yacrd I use a min priority_queue in C++ with `std::priority_queue<size_t, std::vector<size_t>, std::greater<size_t>> stack;` Rust have an equivalent structure `std::collections::BinaryHeap` but we can't set the ordering if I want same behavior I need create a special type, with reverse ordering implementation [source code](https://github.com/natir/yacrd/blob/master/src/chimera.rs#L109). 


# Conclusion

Rust is the language that could replace C++ in all these uses, there is obviously a learning curve but the advantages that Rust brings completely compensate it. It took me about a month to feel comfortable with the language. The next time you lose 4 hours, you will find a memory leak or have managed the packaging of your application designed for Rust.

## External resource

- [Rust vs C++](https://www.slideshare.net/corehard_by/rust-vs-c) slide create for C++ CoreHard Conference
- [The Computer benchmark game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/)


[^1]: Is not True it's just very very hard to create memory leak, if you realy want create a memory leak it's possible, with `unsafe` keyword or if you follow this [page method](https://doc.rust-lang.org/nomicon/leaking.html) but who want do think like that ? 

## Acknowledgements

For proofreading:

- [Maxime Garcia](https://twitter.com/gau)
