---
layout: post
title: PAF I save 90 % of disc space
date: 2018-06-18
published: true
tags: draft overlapper long-read compression
---

{% include setup %}

# PAF I save 90 % of disc space

Durring last week Shaun Jack post this on twitter :

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">
I have a 1.2 TB PAF.gz file of minimap2 all-vs-all alignments of 18 flowcells of Oxford Nanopore reads. Yipes. I believe that&#39;s my first file to exceed a terabyte. Is there a better way? Perhaps removing the subsumed reads before writing the all-vs-all alignments to disk?</p>&mdash; Shaun Jackman (@sjackman) <a href="https://twitter.com/sjackman/status/1047729989318139904?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

For people didn't work on long-read assembly, first welcomme, second minimap is a very good mapper used to find similar region between long read, is output are in PAF for Pairwise Alignment Format, this format are present in [minimap2 man page](https://lh3.github.io/minimap2/minimap2.html#10), roughly it's tsv with for each similare region found (called before match), format store two read name, read length, begin and end position of match, plus some other information.  

This tweet create some discussion and thrid solution was proposed, use classic mapping against reference compression format, filter some match, creation of a new binary compressed format to store all-vs-all mapping.

## Use mapping reference file

Torsten Seemann and me suggest to use sam minimap outupt and compress it in BAM/CRAM but after little apprently isn't work, well.

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">My trouble to convert bam in cram is solved thank to <a href="https://twitter.com/RayanChikhi?ref_src=twsrc%5Etfw">@RayanChikhi</a> !<br><br>minimap output without sequence compress in cram,noref (i.e. tmp_short.cram) is little bit heavier than classic paf compress in gz.<br><br>So it&#39;s probably time for a Binary Alignment Format. <a href="https://t.co/W02wj7tf2I">pic.twitter.com/W02wj7tf2I</a></p>&mdash; Pierre Marijon (@pierre_marijon) <a href="https://twitter.com/pierre_marijon/status/1047798695822024704?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Ok heven remove not necessary field in sam format (sequence and mapping field), and with better compression solution, isn't better than PAF format compress with gzip. Maybe with larger file this solution could be save so space.

## Filter

Heng Li say :

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">Minimap2 reports hits, not only overlaps. The great majority of hits are non-informative to asm. Hits involving repeats particularly hurt. For asm, there are ways to reduce them, but that needs evaluation. I won&#39;t go into that route soon because ... 1/2</p>&mdash; Heng Li (@lh3lh3) <a href="https://twitter.com/lh3lh3/status/1047823011527753728?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Minimap didn't make any assumption about what user want do with read matching, and it's a very good thing but some times you store to many information for your usage. So filter overlap before store him on your disk, could by a good idea.

A little awk, bash, python, {choose your langage} script could make this job perfectly.

Alex Di Genov [suggest to use minimap2 API](https://twitter.com/digenoma/status/1047852263111385088) to build a special minimap with intigrate filter, this solution have probably better performance than *ad hoc *script but it's less flexible you need use minimap2.

My solution is a little soft in rust [fpa (Filter Pairwise Alignment)](https://github.com/natir/fpa), fpa take as input the a paf or mhap, and this can filter match by:
- type: containment, internal-match, dovetail
- length: match is upper or lower than a threshold
- read name: match against a regex, it's a read match against him

fpa is avaible in bioconda and in cargo.

Ok filter match is easy and we have many avaible solution. 

## A Binary Alignment Fromat

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">Is it time for a Binary Alignment Format that uses integer compression techniques?</p>&mdash; Rayan Chikhi (@RayanChikhi) <a href="https://twitter.com/RayanChikhi/status/1047773219086897153?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

This is the question they initiate this blog post.

Her I just want present a little investigation, about how we can compress Pairwise Alignment, I call this format jPAF and it's just a POC and this never change.

Rougly jPAF is a json compressed, so isn't realy binary, but I just want test some idea so it's cool.

We have 3 main object in this json:
- header\_index: a dict they associate an index to an header name
- reads\_index: associate a read name and her length to an index
- matchs: a list of match, a match header\_index

A little example are probably better:

```
{
   "header_index":{
      "0":"read_a",
      "1":"begin_a",
      "2":"end_a",
      "3":"strand",
      "4":"read_b",
      "5":"begin_b",
      "6":"end_b",
      "7":"nb_match",
      "8":"match_length",
      "9":"qual"
   },
   "read_index":[
      {
         "name":"1_2",
         "len":5891
      },
      {
         "name":"2_3",
         "len":4490
      },
   ],
   "match":[
      [
         0,
         1642,
         5889,
         "+",
         1,
         1,
         4248,
         4247,
         4247,
         0,
         "tp:A:S"
      ],
   ]
}
```

Her we have a PAF like header, two read 1_2 and 2_3 with 5891 and 4490 base respectively and one overlap with length 4247 base in same strand between them.

jPAF are fully inspired by PAF same field name I just take the PAF convert it in json and add two little trick to save space.

First tricks write read name and read length one time.
Second tricks is more json trick, first time each record are a dictionary with keyname associate to value, with this solution baf is heaviest than paf. If I associate a field name to a index, I can store record in table not in json object and avoid redondancy.

Ok I have a pretty cool format, to avoid some repetition without loss of information, but I realy save space or not ?

## Result

Dataset: For this I reuse same dataset as may previous blog post. It's two real dataset pacbio one and nanopore one.

Mapping : I run minimap2 mapping with preset ava-pb and ava-ont for pacbio and nanopore respectively

This table present file size and space savings against some other file. sam bam and cram file are long or short, in long we keep all data present in minimap2 output, in short we replace sequence and quality by a \*.

If you want replicate all this result just follow instruction you can found in this [github repro](https://github.com/natir/jPAF).

## Discussion

Ok minimap generate to much match, but it's easy to remove unusfule match, with fpa or with *ad hoc* tools. The format design to store mapping against reference, arn't better than actual format compress with generalist algorithme.

The main problem of jPaf is many quality, read\_index it's save disque space but loss time and RAM, you can't stream out this format you need wait until all alignment are found before write, when you need read file you need keep read\_index in RAM any time. 

But I write'it in two hours, the format is lossless and they save **33 to 64 %** of disk space, depend of compression used. 

Actualy I'm not sure we need binary compressed format for store pairwise alignement against read, but in future with more and more long-read data we probably need it. And this result encourage me to continue search on this problem and read more thing around bam/cram canu ovlStore.

If you want search with me and discussion about Pairwise Aligment format comment section is avaible.
