---
layout: post
title: PAF I save 95 % of disk space
date: 2018-10-09
draft: true
published: true
tags: draft overlapper long-read compression
---

{% include setup %}

# PAF I save 95 % of disk space

During last week Shaun Jack post this tweet:

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">
I have a 1.2 TB PAF.gz file of minimap2 all-vs-all alignments of 18 flowcells of Oxford Nanopore reads. Yipes. I believe that&#39;s my first file to exceed a terabyte. Is there a better way? Perhaps removing the subsumed reads before writing the all-vs-all alignments to disk?</p>&mdash; Shaun Jackman (@sjackman) <a href="https://twitter.com/sjackman/status/1047729989318139904?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

For people who didn't work on long-read assembly, in long-read assembly for correction or assembly graph construction we need map reads against him. [Minimap2](https://github.com/lh3/minimap2) is a very good mapper used to find similar region between long read. It's output are PAF files (Pairwise Alignment Format) and summarize on [minimap2 man page](https://lh3.github.io/minimap2/minimap2.html#10). Roughly it's tsv file which store for each similar region found (called before match): two reads names, reads length, begin and end position of match, plus some other information.  

This tweet creates some discussion and third solution was proposed: 
- using classic mapping against reference compression format
- filter some match
- the creation of a new binary compressed format to store all-vs-all mapping

## Use mapping reference file

Torsten Seemann and I suggest using special flag to get minimap2 output in SAM and compress it in BAM/CRAM format. But apparently it isn't working, well.

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">My trouble to convert bam in cram is solved thank to <a href="https://twitter.com/RayanChikhi?ref_src=twsrc%5Etfw">@RayanChikhi</a> !<br><br>minimap output without sequence compress in cram,noref (i.e. tmp_short.cram) is little bit heavier than classic paf compress in gz.<br><br>So it&#39;s probably time for a Binary Alignment Format. <a href="https://t.co/W02wj7tf2I">pic.twitter.com/W02wj7tf2I</a></p>&mdash; Pierre Marijon (@pierre_marijon) <a href="https://twitter.com/pierre_marijon/status/1047798695822024704?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

OK heaven I have removed unecessary field in SAM format (sequence and mapping field), and with better compression solution, It isn't better than PAF format compression with gzip. Maybe with larger file CRAM could be better than PAF gzipped this solution, but I am not convienence by this solution.

## Filter

Heng Li say :

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">Minimap2 reports hits, not only overlaps. The great majority of hits are non-informative to asm. Hits involving repeats particularly hurt. For asm, there are ways to reduce them, but that needs evaluation. I won&#39;t go into that route soon because ... 1/2</p>&mdash; Heng Li (@lh3lh3) <a href="https://twitter.com/lh3lh3/status/1047823011527753728?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Minimap didn't make any assumption about what user wants to do with read matching, and it's a very good thing but sometimes you store too much information for your usage. So filtering overlap before storing it on your disk, could by a good idea.

Awk, Bash, Python, {choose your language} script could do this job perfectly.

Alex Di Genov [suggest using minimap2 API](https://twitter.com/digenoma/status/1047852263111385088) to build a special minimap with integrating filters, this solution has probably better performance than *ad hoc* script but it's less flexible, can't be applied to other mapper.

My solution is a little soft in rust [fpa (Filter Pairwise Alignment)](https://github.com/natir/fpa), fpa take as input the paf or mhap, and this can filter match by:
- type: containment, internal-match, dovetail
- length: match is upper or lower than a threshold
- read name: match against a regex, it's a read match against him self

fpa is available in bioconda and in cargo.

OK filter match is easy and we have many available solution.

## A Binary Alignment Fromat

<blockquote class="twitter-tweet" data-lang="fr">
<p lang="en" dir="ltr">Is it time for a Binary Alignment Format that uses integer compression techniques?</p>&mdash; Rayan Chikhi (@RayanChikhi) <a href="https://twitter.com/RayanChikhi/status/1047773219086897153?ref_src=twsrc%5Etfw">4 octobre 2018</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

This is the question they initiate this blog post.

Her I just want to present a little investigation, about how we can compress Pairwise Alignment, I call this format jPAF and it's just a POC don't use it please !!

jPAF is a json file that contains the same information as a paf file but it is reoganized to save space", so it isn't really a binary, but I just wanted to test some ideas... So it's cool.

We have 3 main object in this json:
- header\_index: a dict they associate an index to a header name
- reads\_index: associate a read name and her length to an index
- matchs: a list of match, a match header\_index

A little example are probably better:

```
{
   "header_index":{
      "0":"read_a",
      "1":"begin_a",
      … # index associate to the paf header name
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
         0,     # index of read in read_index table
         1642,  # begin position for read A
         5889,  # end position of read A
         "+",   # read have same strand
         1,	# index of read in read_index table
         1,	# begin position of read B
         4248,	# end position of read B
         4247,	# the other fields of the paf format
         4247,
         0,
         "tp:A:S"
      ],
   ]
}
```

Her we have two read 1_2 and 2_3 with 5891 and 4490 base respectively and one overlap with length 4247 base in the same strand between them.

jPAF are fully inspired by PAF same field name I just take the PAF convert it in json and add two little trick to save space.

First tricks write read names and read length one time.
Second tricks is more json trick, first time each record are a dictionary with keyname associate to value, with this solution baf is heaviest than paf. If I associate a field name to a index, I can store records just in classic table and avoid redundancy.

OK I have a pretty cool format, to avoid some repetition without loss of information, but I really save space or not ?

## Result

Dataset: For this I reuse the same dataset as may previous blog post. It's two real dataset [pacbio](https://github.com/PacificBiosciences/DevNet/wiki/E.-coli-Bacterial-Assembly) one and [nanopore](http://lab.loman.net/2015/09/24/first-sqk-map-006-experiment/) one.

Mapping : I run minimap2 mapping with preset ava-pb and ava-ont for pacbio and nanopore respectively

basic.sam designate the minimap output in sam format, short.sam designate the minimap output with SEQ, QUAL field replace by a '*'.

### PAF against jPAF

Nanopore:

|-------------------	+-------------------	+-------------------	+-------------------	+-------------------	|
|                   	| paf		   	| paf.gz	 	| paf.bz2		| paf.xz	   	|
|-------------------	+-------------------	+-------------------	+-------------------	+-------------------	|
| **jpaf**          	| 64.65 % 	        |                   	|                	|		 	|
| **jpaf.gz**  		| 94.73 %	     	| 64.13 %	 	| 66.11 %	     	| 22.01 %	 	|
| **jpaf.bz2** 		| 94.42 %	 	| 62.01 %	 	| 64.11 %	 	| 17.41 %	 	|
| **jpaf.xz**  		| 95.84 %	 	| 71.70 %	 	| 73.26 %	 	| 38.47 %	 	|
|-------------------	+-------------------	+-------------------	+-------------------	+-------------------	|

Pacbio:

|---------------+---------------+---------------+---------------+---------------|
|          	| paf     	| paf.gz  	| paf.bz2 	| paf.xz  	|
|---------------+---------------+---------------+---------------+---------------|
| **jpaf**     	| 71.04 % 	|         	|         	|         	|
| **jpaf.gz**  	| 92.57 % 	| 50.36 % 	| 34.08 % 	| 28.79 % 	|
| **jpaf.bz2** 	| 93.78 % 	| 58.43 % 	| 44.79 % 	| 40.36 % 	|
| **jpaf.xz**  	| 93.73 % 	| 58.14 % 	| 44.41 % 	| 39.95 % 	|
|---------------+---------------+---------------+--------------+----------------|

If I compare PAF against jPAF compress with lzma I win **95.84 %**, I have justification for my title, *it's 99 % when remove I removed same read, containment, internal, less than 500 bp match with fpa*.

It's less impressive but more accurate and realistic at the same compression level I earn between **71.04 %** to **38.47 %**, we can notive a decrease of efficacity of jpaf against paf when compression algorithm become better.

### Effect of compression on each format

Nanopore:

|-----------+-------------+------+--------+--------+--------+--------+--------|
|           |             | raw  | gz     | bz2    | xz     | bam    | cram   |
|-----------+-------------+------+--------+--------+--------+--------+--------|
| paf       |     size    | 2.2G |  317M  |  336M  |  146M  |        |        |
|           | saved space |      | 85.31% | 84.45% | 93.24% |        |        |
| jpaf      |        size |  762M|   114M |   121M |    90M |        |        |
|           | saved space |      | 85.09% | 84.21% | 88.24% |        |        |
| basic.sam |        size |  25G |        |        |        |   5.8G |   5.2G |
|           | saved space |      |        |        |        | 76.45% | 78.57% |
| short.sam | size        | 24G  |        |        |        | 5.5G   | 4.8G   |
|           | saved space |      |        |        |        | 76.61% | 79.55% |
|-----------+-------------+------+--------+--------+--------+--------+--------|


Pacbio:

|-----------+-------------+------+--------+--------+--------+--------+--------|
|           |             | raw  | gz     | bz2    | xz     | bam    | cram   |
|-----------+-------------+------+--------+--------+--------+--------+--------|
| paf       |     size    | 2.4G |  361M  |  272M  |  252M  |        |        |
|           | saved space |      | 85.04% | 88.73% | 89.57% |        |        |
| jpaf      |        size | 698M |   179M |   150M |   151M |        |        |
|           | saved space |      | 74.36% | 78.52% | 78.38% |        |        |
| basic.sam |        size |  24G |        |        |        |   8.4G |   4.5G |
|           | saved space |      |        |        |        | 64.44% | 81.28% |
| short.sam | size        | 24G  |        |        |        | 8.4G   | 4.4G   |
|           | saved space |      |        |        |        | 64.41% | 81.05% |
|-----------+-------------+------+--------+--------+--------+--------+--------|


BAM/CRAM compression aren't better than classic compression format (confirm preliminar result). Heaven the compression ratio are quiet similar in each format, this table confirm what we observe in previous section compression ratio are better on PAF than jPAF but jPAF still be smaller than PAF and I can't explain this.


If you want to replicate results just follow instruction avaible at [github repro](https://github.com/natir/jPAF), full data are avaible her [nanopore]({{ POST_ASSETS_PATH }}/nanopore.csv), [pacbio]({{ POST_ASSETS_PATH }}/pacbio.csv).

## Discussion

Minimap generate to much match, but it's easy to remove unusual match, with fpa or with *ad hoc* tools. The format design to store mapping against reference isn't better than actual format compress with generalist algorithm.

The main problem of jPaf is many quality, read\_index it's save disk space but loss in time and RAM. You can't stream out this format, you need to wait until all alignment are found before writing. If you want read file you need keep read\_index in RAM all time. 

But I written it in two hours, the format is lossless and they save **33 to 64 %** of disk space. Obviously we could save even more space by moving from a text format to a binary format, especially in the numeric and strand fields (7 bit per match). But it's easier to test things with a text file.

In conclusion the solution of Shaun Jackman trouble are probably filtering, but in future with more and more long-read data we probably need it. This result encourages me to continue on this approch and I need read more thing about BAM/CRAM compression technic, canu ovlStore.

